/**
 * sarvamAgent.js
 *
 * Sarvam AI-powered Web3 DeFi Intent Parser
 *
 * Accepts a natural-language user prompt and returns a strictly typed JSON object:
 *   { action: string, amount: string | number, token: string }
 *
 * Uses the Sarvam AI REST API (OpenAI-compatible chat completions endpoint).
 * The `sarvamai` npm package ships only speech / translation / document APIs;
 * the LLM chat interface is accessed directly via the REST endpoint below.
 *
 * Required env variable (Vite project):
 *   VITE_SARVAM_API_KEY  — your Sarvam AI subscription key
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const SARVAM_API_BASE = "/sarvam-api";
const SARVAM_CHAT_ENDPOINT = `${SARVAM_API_BASE}/v1/chat/completions`;

/**
 * Default model served by Sarvam AI's chat completions API.
 * Swap to any Sarvam-supported model identifier if needed.
 */
const SARVAM_MODEL = "sarvam-30b";

/** Maximum time (ms) to wait for a single API attempt before aborting. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Number of additional retry attempts after the first failure. */
const MAX_RETRIES = 2;

/** Base delay (ms) for exponential back-off between retries. */
const RETRY_BASE_DELAY_MS = 800;

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a strict Web3 DeFi intent parser. You must output ONLY a raw, valid JSON object. DO NOT output <think> tags. DO NOT output markdown formatting like \`\`\`json. DO NOT output any conversational text before or after the JSON.

If the user specifies a clear transactional intent (e.g. contains an action, amount, and token, such as "swap 44.3625 TYI to ETH in hindi"), you MUST resolve it to the transaction schema:
{
  "action": "<one of: swap | mint | burn | stake | unstake | transfer | approve | bridge | lend | borrow | repay | claim>",
  "amount": "<numeric string, e.g. '0.5' or '100', or 'max' if the user specifies the full balance>",
  "token": "<uppercase token symbol, e.g. 'ETH', 'USDC', 'WBTC'>"
}
DO NOT output an error/conversational message if the transactional parameters are present, even if the user appends language instructions like "in hindi" or "en español". The JSON output must remain strictly in English.

Rules for vague, conversational, or bridging input (only when parameters like amount or token are missing or ambiguous):
1. MULTILINGUAL SUPPORT: You must detect and process queries in the user's language (e.g. Hindi, Spanish, French, German, Italian, etc.). If the input is conversational, vague, or asks a question, your response in the 'error' key must be written in that SAME language.
2. BRIDGING GUIDANCE: If the user asks about bridging (e.g., 'How do I bridge?', 'bridge money', or 'transfer to another chain'), you must provide a detailed guide in their query language inside the 'error' key. Explain that:
   - Bridging is flexible via the Universal Gas Framework (UGF).
   - They can bridge assets gaslessly between EVM networks (e.g., Ethereum Sepolia to Base Sepolia).
   - They only need to select the asset, specify the amount, and confirm the EIP-712 cryptographic handshake.
   - Gas fees are paid gaslessly in TYI (Mock USD) with zero ETH required.
3. When prompting the user for an amount (e.g. if the token is known but amount is missing), check the balances in the provided Context. If a balance is available, mention it conversationally in their language to guide the user (e.g. "How much ETH would you like to bridge? Your current balance is 0.05 ETH.").

Example for vague query: { "error": "I can help with that! Which token and what amount would you like to bridge, and to which network?" }

Rules you MUST follow:
1. Output ONLY the raw JSON object — no markdown fences, no explanations, no extra keys.
2. If the user specifies two tokens (e.g. "swap ETH for USDC"), set "token" to the SOURCE token.
3. Normalise amounts: strip currency symbols, convert words like "half" → "0.5", "a hundred" → "100".
4. Never include any field outside the schema defined above.
5. HARD SECURITY CONSTRAINT: You are strictly sandboxed to handle onchain transactional parameters exclusively. Zero automation on any social platforms is allowed. You must not integrate with, scrape, or post to social media networks. If a prompt includes social media actions, return { "error": "Social media automation is strictly disabled for security reasons." }.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves the Sarvam API key from the Vite environment or falls back to an
 * explicit override (useful in Node.js test scripts).
 *
 * @param {string} [override] - Explicit API key (takes precedence over env).
 * @returns {string} The resolved API key.
 * @throws {Error} When no key is available.
 */
function resolveApiKey(override) {
  const key =
    override ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SARVAM_API_KEY) ||
    (typeof process !== "undefined" && process.env?.SARVAM_API_KEY) ||
    "";

  if (!key || key.trim() === "") {
    throw new Error(
      "[SarvamAgent] API key not found. " +
        "Set VITE_SARVAM_API_KEY in your .env file (Vite) " +
        "or SARVAM_API_KEY in the environment (Node.js)."
    );
  }

  return key.trim();
}

/**
 * Exponential back-off sleep.
 *
 * @param {number} attempt - Zero-based retry attempt index.
 * @returns {Promise<void>}
 */
function sleep(attempt) {
  const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Classifies an HTTP status code into a human-readable error category.
 *
 * @param {number} status
 * @returns {string}
 */
function classifyHttpError(status) {
  if (status === 401 || status === 403) return "AuthenticationError";
  if (status === 422) return "ValidationError";
  if (status === 429) return "RateLimitError";
  if (status >= 500) return "ServerError";
  return "ApiError";
}

/**
 * Attempts to extract a valid JSON intent object from the raw model output.
 * Handles common edge cases such as markdown code fences or leading prose.
 *
 * @param {string} raw - Raw text from the model.
 * @returns {{ action: string, amount: string, token: string } | { error: string }}
 * @throws {SyntaxError} When the text cannot be parsed.
 */
function extractIntentJson(raw) {
  if (!raw) throw new Error("Empty response from AI.");

  // 1. Strip out <think> blocks entirely using Regex (handles both closed and unclosed/truncated blocks)
  let cleanText = raw.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();

  // 2. Strip out Markdown JSON wrappers if the model still outputs them
  cleanText = cleanText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // 3. Locate the first JSON object in case the model prefixed/suffixed with prose
  const jsonStart = cleanText.indexOf("{");
  const jsonEnd = cleanText.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
    throw new SyntaxError(`No JSON object found in model response: "${raw}"`);
  }

  const parsed = JSON.parse(cleanText.slice(jsonStart, jsonEnd + 1));

  // Check for error response
  if (parsed.error) {
    return { error: String(parsed.error) };
  }

  // Validate required keys for valid intent
  const required = ["action", "amount", "token"];
  for (const key of required) {
    if (!(key in parsed)) {
      throw new SyntaxError(`Missing required key "${key}" in parsed intent: ${JSON.stringify(parsed)}`);
    }
  }

  return {
    action: String(parsed.action).toLowerCase(),
    amount: String(parsed.amount),
    token: String(parsed.token).toUpperCase(),
  };
}

// ─── Core API Call ────────────────────────────────────────────────────────────

/**
 * Sends a single chat-completion request to the Sarvam AI endpoint.
 *
 * @param {string} userPrompt
 * @param {string} apiKey
 * @returns {Promise<string>} Raw assistant message content.
 * @throws {Error} On non-retryable HTTP errors or network failures.
 */
async function callSarvamApi(userPrompt, apiKey, context = "") {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(SARVAM_CHAT_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: SARVAM_MODEL,
        messages: [
          { role: "system", content: context ? `${SYSTEM_PROMPT}\n\nContext:\n${context}` : SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,   // Keep determinism high for structured output
        max_tokens: 1024,
        response_format: { type: "json_object" }, // Request JSON mode when supported
      }),
    });
  } catch (networkErr) {
    if (networkErr.name === "AbortError") {
      throw Object.assign(
        new Error(`[SarvamAgent] Request timed out after ${REQUEST_TIMEOUT_MS}ms`),
        { code: "TIMEOUT" }
      );
    }
    throw Object.assign(
      new Error(`[SarvamAgent] Network error — ${networkErr.message}`),
      { code: "NETWORK_ERROR", cause: networkErr }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch (_) {
      // best-effort body read
    }

    const errorType = classifyHttpError(response.status);
    const err = new Error(
      `[SarvamAgent] ${errorType} (HTTP ${response.status}): ${body || response.statusText}`
    );
    err.code = errorType;
    err.status = response.status;
    err.body = body;

    // Mark non-transient errors so the retry loop can bail early
    if (response.status === 401 || response.status === 403 || response.status === 422) {
      err.nonRetryable = true;
    }

    throw err;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "[SarvamAgent] Unexpected API response shape — no content in choices[0].message"
    );
  }

  return content;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a natural-language DeFi intent using the Sarvam AI LLM.
 *
 * @param {string} userPrompt
 *   The user's natural language instruction, e.g. "swap 0.5 ETH for USDC".
 *
 * @param {object} [options]
 * @param {string} [options.apiKey]
 *   Explicit Sarvam API key. Falls back to `VITE_SARVAM_API_KEY` / `SARVAM_API_KEY` env vars.
 * @param {number} [options.maxRetries=2]
 *   Override the maximum number of retry attempts.
 *
 * @returns {Promise<{ action: string, amount: string, token: string }>}
 *   Parsed DeFi intent object.
 *
 * @throws {Error} When the API is unreachable, returns a non-retryable error,
 *   or the response cannot be parsed into the expected schema after all retries.
 *
 * @example
 * const intent = await parseDefiIntent("swap 0.5 ETH for USDC");
 * // → { action: "swap", amount: "0.5", token: "ETH" }
 *
 * @example
 * const intent = await parseDefiIntent("mint 10 SPECTRA NFTs");
 * // → { action: "mint", amount: "10", token: "SPECTRA" }
 */
export async function parseDefiIntent(userPrompt, options = {}) {
  if (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim() === "") {
    throw new TypeError("[SarvamAgent] userPrompt must be a non-empty string.");
  }

  const apiKey = resolveApiKey(options.apiKey);
  const retries = options.maxRetries ?? MAX_RETRIES;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.warn(`[SarvamAgent] Retry ${attempt}/${retries} after error: ${lastError?.message}`);
      await sleep(attempt - 1);
    }

    try {
      const rawContent = await callSarvamApi(userPrompt.trim(), apiKey, options.context);
      const intent = extractIntentJson(rawContent);

      if (attempt > 0) {
        console.info(`[SarvamAgent] Succeeded on retry ${attempt}.`);
      }

      return intent;
    } catch (err) {
      lastError = err;

      // Do not retry auth / validation errors — they won't resolve on their own
      if (err.nonRetryable) {
        console.error(`[SarvamAgent] Non-retryable error (${err.code}): ${err.message}`);
        break;
      }

      // Log transient errors but keep retrying
      console.warn(`[SarvamAgent] Attempt ${attempt + 1} failed: ${err.message}`);
    }
  }

  // All attempts exhausted — surface the last known error with context
  const finalError = new Error(
    `[SarvamAgent] Failed to parse DeFi intent after ${retries + 1} attempt(s). ` +
      `Last error: ${lastError?.message}`
  );
  finalError.cause = lastError;
  finalError.code = lastError?.code || "UNKNOWN";
  throw finalError;
}

/**
 * Convenience wrapper — identical to `parseDefiIntent` but returns `null`
 * instead of throwing, making it safe to use in UI event handlers without
 * a try/catch wrapper.
 *
 * @param {string} userPrompt
 * @param {object} [options]
 * @returns {Promise<{ action: string, amount: string, token: string } | null>}
 */
export async function tryParseDefiIntent(userPrompt, options = {}) {
  try {
    return await parseDefiIntent(userPrompt, options);
  } catch (err) {
    console.error("[SarvamAgent] tryParseDefiIntent caught error:", err);
    return null;
  }
}

/**
 * Handles general Web3 and blockchain queries using Sarvam AI.
 * Returns a plain text conversational response instead of a structured intent.
 */
export async function askGeneralAgent(userPrompt, options = {}) {
  if (!userPrompt || typeof userPrompt !== "string") return "I didn't catch that.";
  
  const apiKey = resolveApiKey(options.apiKey);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    const response = await fetch(SARVAM_CHAT_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: SARVAM_MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are Spectra, an advanced AI Assistant for a Web3 Decentralized Exchange. You must ONLY answer questions related to Web3, blockchain, crypto, or Spectra. If the user asks about ANYTHING else, politely refuse to answer and remind them you are a Web3 assistant. EXTREMELY IMPORTANT: Keep your response strictly under 300 characters. Be highly concise and conversational. Do not use markdown. Speak in the same language the user uses." 
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error("[SarvamAgent] askGeneralAgent HTTP Error:", response.status, errText);
      return null;
    }
    
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("[SarvamAgent] askGeneralAgent missing content in response:", data);
      return null;
    }
    
    return content;
  } catch (err) {
    console.error("[SarvamAgent] askGeneralAgent catch error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
