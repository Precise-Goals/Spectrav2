/**
 * intentParser.js
 *
 * Bridge-aware intent parser built on top of the existing Sarvam AI LLM.
 *
 * Extends `parseDefiIntent` (sarvamAgent.js) with:
 *   1. Registry validation — confirmed chains + tokens exist in LI.FI.
 *   2. Cross-VM mismatch detection — EVM ↔ non-EVM routes require a
 *      separate `destinationAddress` because the derivation path differs.
 *   3. Strict JSON schema enforcement for the bridge-specific shape.
 *
 * Ponytail: Skipped Zod/yup for schema validation; a hand-rolled shape
 * check is 12 lines and adds zero bundle weight.
 */

import { resolveChain, resolveToken, isEvmChain } from './registryService.js';

// ── Bridge Intent Schema ───────────────────────────────────────────────────────
//
// {
//   sourceChain:        string   (required)
//   destinationChain:   string   (required)
//   tokenSymbol:        string   (required)
//   amount:             string   (required, numeric)
//   destinationAddress: string   (optional — required when Cross-VM)
// }

const BRIDGE_SYSTEM_PROMPT = `You are a strict cross-chain bridge intent parser. 
Output ONLY a raw valid JSON object matching this exact schema:
{
  "sourceChain":        "<chain name or id, e.g. 'ethereum', 'polygon', 'stellar'>",
  "destinationChain":   "<chain name or id>",
  "tokenSymbol":        "<uppercase token symbol, e.g. 'ETH', 'USDC'>",
  "amount":             "<numeric string, e.g. '0.5' or '100'>",
  "destinationAddress": "<wallet address on destination chain, or null if not provided>"
}

Rules:
1. Output ONLY the raw JSON — no markdown, no prose, no extra keys.
2. Normalise chain names: "eth" → "ethereum", "poly" → "polygon", "avax" → "avalanche".
3. If the user does not specify a destination chain, set destinationChain to null.
4. If the user does not provide a destinationAddress, set it to null.
5. Never include any field outside the schema above.
6. If the intent is ambiguous or non-bridge in nature, return:
   { "error": "<concise reason>" }`;

// ── Internal Sarvam call ───────────────────────────────────────────────────────

const SARVAM_CHAT_ENDPOINT = '/sarvam-api/v1/chat/completions';
const SARVAM_MODEL = 'sarvam-30b';
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Calls the Sarvam AI chat endpoint with the bridge-specific system prompt.
 *
 * @param {string} userPrompt
 * @param {string} apiKey
 * @returns {Promise<string>} Raw assistant message content.
 */
async function _callBridgeParser(userPrompt, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(SARVAM_CHAT_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        model: SARVAM_MODEL,
        messages: [
          { role: 'system', content: BRIDGE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.05, // near-zero temp for deterministic structured output
        max_tokens: 512,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (netErr) {
    if (netErr.name === 'AbortError') {
      throw Object.assign(new Error(`[IntentParser] Request timed out after ${REQUEST_TIMEOUT_MS}ms`), { code: 'TIMEOUT' });
    }
    throw Object.assign(new Error(`[IntentParser] Network error — ${netErr.message}`), { code: 'NETWORK_ERROR', cause: netErr });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw Object.assign(
      new Error(`[IntentParser] AI API error (HTTP ${res.status}): ${body}`),
      { code: 'API_ERROR', status: res.status }
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('[IntentParser] Empty AI response — no content in choices[0]');
  return content;
}

// ── Schema Extraction ──────────────────────────────────────────────────────────

/**
 * Extracts and validates the raw JSON string from AI output.
 * Handles code-fence stripping and prose prefixes.
 *
 * @param {string} raw
 * @returns {object} Parsed JSON object
 * @throws {SyntaxError}
 */
function _extractJson(raw) {
  let text = raw
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new SyntaxError(`[IntentParser] No JSON found in response: "${raw}"`);
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Validates that all required bridge fields are present.
 *
 * @param {object} parsed
 * @throws {Error}
 */
function _assertBridgeShape(parsed) {
  const required = ['sourceChain', 'destinationChain', 'tokenSymbol', 'amount'];
  for (const key of required) {
    if (!(key in parsed) || parsed[key] === null || parsed[key] === undefined) {
      throw new Error(`[IntentParser] Missing required field "${key}" in parsed bridge intent.`);
    }
  }
  if (isNaN(Number(parsed.amount))) {
    throw new Error(`[IntentParser] Invalid amount: "${parsed.amount}"`);
  }
}

// ── Cross-VM Detection ─────────────────────────────────────────────────────────

/**
 * Determines whether a source→destination pair crosses VM boundaries.
 *
 * EVM chains all share the same key-derivation path (secp256k1/m/44'/60').
 * Non-EVM chains (Stellar, Solana, Bitcoin) use different address formats.
 * Bridging between them requires an explicit destination address from the user.
 *
 * @param {object} sourceChain  - Registry chain object
 * @param {object} destChain    - Registry chain object
 * @returns {boolean}
 */
function _isCrossVmRoute(sourceChain, destChain) {
  return isEvmChain(sourceChain) !== isEvmChain(destChain);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} BridgeIntent
 * @property {string}       sourceChain          - Resolved chain key (e.g. "ETH", "POL")
 * @property {number}       sourceChainId        - LI.FI numeric chain id
 * @property {string}       destinationChain     - Resolved chain key
 * @property {number}       destinationChainId   - LI.FI numeric chain id
 * @property {string}       tokenSymbol          - Uppercase token symbol
 * @property {string}       tokenAddress         - ERC-20 (or equivalent) contract address
 * @property {number}       tokenDecimals        - Token decimal places
 * @property {string}       amount               - Human-readable amount string
 * @property {string|null}  destinationAddress   - Optional explicit target address
 * @property {boolean}      requiresDestAddress  - True when Cross-VM and no address provided
 */

/**
 * parseBridgeIntent(userPrompt, options)
 *
 * Parses a natural-language bridge command into a fully resolved, registry-validated
 * BridgeIntent object ready for consumption by `lifiAggregator.js`.
 *
 * If the route crosses VM boundaries (EVM ↔ non-EVM) and the user has not
 * provided a destination address, `requiresDestAddress` will be set to `true`
 * and the caller should prompt the UI for the missing address before proceeding.
 *
 * @param {string} userPrompt  - e.g. "bridge 50 USDC from Ethereum to Stellar"
 * @param {object} [options]
 * @param {string} [options.apiKey]             - Override Sarvam API key
 * @param {string} [options.destinationAddress] - Pre-filled destination address (from prior UI prompt)
 *
 * @returns {Promise<BridgeIntent>}
 * @throws {Error}  When the intent is ambiguous, chains/tokens not found, or AI fails.
 */
export async function parseBridgeIntent(userPrompt, options = {}) {
  if (!userPrompt?.trim()) throw new TypeError('[IntentParser] userPrompt must be a non-empty string.');

  const apiKey =
    options.apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SARVAM_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.SARVAM_API_KEY) ||
    '';

  if (!apiKey) throw new Error('[IntentParser] No Sarvam API key configured.');

  // ── Step 1: Call AI parser ─────────────────────────────────────────────────
  const rawContent = await _callBridgeParser(userPrompt.trim(), apiKey);
  const parsed = _extractJson(rawContent);

  // Surface AI-generated error messages directly (e.g. "ambiguous intent")
  if (parsed.error) throw new Error(`[IntentParser] AI: ${parsed.error}`);

  _assertBridgeShape(parsed);

  // ── Step 2: Resolve chains from LI.FI registry ────────────────────────────
  const [sourceChain, destChain] = await Promise.all([
    resolveChain(parsed.sourceChain),
    resolveChain(parsed.destinationChain),
  ]);

  if (!sourceChain) {
    throw new Error(`[IntentParser] Source chain not supported in LI.FI registry: "${parsed.sourceChain}"`);
  }
  if (!destChain) {
    throw new Error(`[IntentParser] Destination chain not supported in LI.FI registry: "${parsed.destinationChain}"`);
  }

  // ── Step 3: Resolve token from registry ───────────────────────────────────
  const token = await resolveToken(parsed.tokenSymbol, sourceChain.id);
  if (!token) {
    throw new Error(
      `[IntentParser] Token "${parsed.tokenSymbol}" not found on chain "${sourceChain.name}" (id=${sourceChain.id}) in LI.FI registry.`
    );
  }

  // ── Step 4: Cross-VM mismatch detection ───────────────────────────────────
  const crossVm = _isCrossVmRoute(sourceChain, destChain);
  const destAddress = options.destinationAddress || parsed.destinationAddress || null;

  const requiresDestAddress = crossVm && !destAddress;

  if (requiresDestAddress) {
    // Return a partial intent signalling the UI must collect the destination address
    return {
      sourceChain:         sourceChain.key,
      sourceChainId:       sourceChain.id,
      destinationChain:    destChain.key,
      destinationChainId:  destChain.id,
      tokenSymbol:         token.symbol,
      tokenAddress:        token.address,
      tokenDecimals:       token.decimals,
      amount:              parsed.amount,
      destinationAddress:  null,
      requiresDestAddress: true,
      // Contextual metadata to help the UI render a clear prompt
      _crossVmMeta: {
        sourceChainType: sourceChain.chainType,
        destChainType:   destChain.chainType,
        message: `This route bridges from ${sourceChain.chainType} to ${destChain.chainType}. Please provide your ${destChain.name} wallet address.`,
      },
    };
  }

  // ── Step 5: Return fully resolved intent ──────────────────────────────────
  return {
    sourceChain:         sourceChain.key,
    sourceChainId:       sourceChain.id,
    destinationChain:    destChain.key,
    destinationChainId:  destChain.id,
    tokenSymbol:         token.symbol,
    tokenAddress:        token.address,
    tokenDecimals:       token.decimals,
    amount:              parsed.amount,
    destinationAddress:  destAddress,
    requiresDestAddress: false,
  };
}
