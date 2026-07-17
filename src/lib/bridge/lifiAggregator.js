/**
 * lifiAggregator.js
 *
 * Transaction Planner backed by the LI.FI Bridge Aggregator API.
 *
 * Accepts a fully resolved BridgeIntent from `intentParser.js` and produces
 * an ordered ExecutionPlan that the frontend wallet layer can consume directly.
 *
 * ExecutionPlan is always a two-step array:
 *   [0] APPROVE  — Approve the LI.FI router to spend the user's token
 *   [1] EXECUTE  — Submit the raw transactionRequest returned by /v1/quote
 *
 * For native tokens (ETH, AVAX, etc.) the APPROVE step is omitted because
 * native transfers do not require an ERC-20 allowance.
 *
 * Ponytail: Skipped the @lifi/sdk (~900 kB); a single /v1/quote fetch + two
 * well-formed action objects replaces the entire SDK surface for our use case.
 */

const LIFI_BASE = 'https://li.quest/v1';

// LI.FI's canonical zero-address used to represent native gas tokens
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Returns true if the token address represents a native gas token.
 * LI.FI uses the zero address as the canonical native sentinel.
 *
 * @param {string} address
 * @returns {boolean}
 */
function _isNativeToken(address) {
  return !address || address.toLowerCase() === NATIVE_TOKEN_ADDRESS;
}

/**
 * Convert a human-readable decimal amount to its smallest unit representation
 * as a string (e.g. "1.5" USDC with 6 decimals → "1500000").
 *
 * Handles floating-point imprecision by using BigInt arithmetic.
 *
 * @param {string|number} amount    - Human-readable amount (e.g. "1.5")
 * @param {number}        decimals  - Token decimals (e.g. 6 for USDC, 18 for ETH)
 * @returns {string}                - Amount in smallest unit as a plain string
 */
function _toSmallestUnit(amount, decimals) {
  const [whole = '0', frac = ''] = String(amount).split('.');
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals);
  return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(fracPadded || '0')).toString();
}

// ── LI.FI Quote Fetch ─────────────────────────────────────────────────────────

/**
 * Queries the LI.FI /v1/quote endpoint and returns the raw response.
 *
 * @param {object} params
 * @param {number}      params.fromChain     - Source chain id (e.g. 1 for Ethereum)
 * @param {number}      params.toChain       - Destination chain id
 * @param {string}      params.fromToken     - Source token contract address
 * @param {string}      params.toToken       - Destination token contract address
 * @param {string}      params.fromAmount    - Amount in smallest unit (no decimals)
 * @param {string}      params.fromAddress   - Sender's wallet address
 * @param {string|null} params.toAddress     - Receiver's wallet address (null = same as fromAddress)
 * @returns {Promise<object>} Raw LI.FI quote object
 * @throws {Error} On API errors, unsupported routes, or insufficient liquidity
 */
async function _fetchQuote(params) {
  const url = new URL(`${LIFI_BASE}/quote`);

  url.searchParams.set('fromChain',   String(params.fromChain));
  url.searchParams.set('toChain',     String(params.toChain));
  url.searchParams.set('fromToken',   params.fromToken);
  url.searchParams.set('toToken',     params.toToken);
  url.searchParams.set('fromAmount',  params.fromAmount);
  url.searchParams.set('fromAddress', params.fromAddress);

  if (params.toAddress) {
    url.searchParams.set('toAddress', params.toAddress);
  }

  // Request testnet routes when both chains are testnets
  // LI.FI automatically scopes by chainId — no extra flag needed

  let res;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
  } catch (netErr) {
    throw Object.assign(
      new Error(`[lifiAggregator] Network error fetching quote: ${netErr.message}`),
      { code: 'NETWORK_ERROR', cause: netErr }
    );
  }

  // ── Error handling ─────────────────────────────────────────────────────────
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch (_) { /* best-effort */ }

    // Parse LI.FI structured error when available
    let lifiError = {};
    try { lifiError = JSON.parse(body); } catch (_) { /* not JSON */ }

    const code = lifiError?.code || res.status;
    const message = lifiError?.message || body || res.statusText;

    // Map known LI.FI error codes to user-readable messages
    if (code === 'NO_POSSIBLE_ROUTE' || res.status === 404) {
      throw Object.assign(
        new Error(`[lifiAggregator] No route found for this pair. The bridge may not support this token/chain combination.`),
        { code: 'NO_ROUTE' }
      );
    }

    if (code === 'AMOUNT_TOO_LOW' || message?.toLowerCase().includes('too low')) {
      throw Object.assign(
        new Error(`[lifiAggregator] Amount too low. Increase the transfer amount to meet the minimum threshold.`),
        { code: 'AMOUNT_TOO_LOW' }
      );
    }

    if (code === 'INSUFFICIENT_LIQUIDITY' || message?.toLowerCase().includes('liquidity')) {
      throw Object.assign(
        new Error(`[lifiAggregator] Insufficient liquidity for this route at the requested amount.`),
        { code: 'INSUFFICIENT_LIQUIDITY' }
      );
    }

    throw Object.assign(
      new Error(`[lifiAggregator] LI.FI API error (HTTP ${res.status}): ${message}`),
      { code: 'API_ERROR', status: res.status, body }
    );
  }

  return res.json();
}

// ── Plan Builder ──────────────────────────────────────────────────────────────

/**
 * Constructs the APPROVE action object.
 *
 * The frontend wallet layer should call `token.approve(routerAddress, MaxUint256)`
 * using the data in this action before submitting the EXECUTE step.
 *
 * @param {string} tokenAddress   - ERC-20 contract address to approve
 * @param {string} routerAddress  - LI.FI router address that will spend the tokens
 * @param {number} chainId        - Chain id where the approval must be sent
 * @param {string} fromAmount     - Amount in smallest unit (for UI display only)
 * @returns {object} APPROVE action
 */
function _buildApproveAction(tokenAddress, routerAddress, chainId, fromAmount) {
  return {
    type: 'APPROVE',
    chainId,
    token: tokenAddress,
    spender: routerAddress,
    // MaxUint256 approval avoids repeated approval transactions in future swaps.
    // The frontend should use ethers.MaxUint256 when constructing the calldata.
    amount: 'MAX',
    // Human-readable minimum required for this specific transaction
    minimumRequired: fromAmount,
    description: `Approve LI.FI router to spend your tokens on chain ${chainId}`,
  };
}

/**
 * Constructs the EXECUTE action object.
 *
 * The `transactionRequest` field is the raw payload returned by LI.FI and can be
 * passed directly to `signer.sendTransaction(transactionRequest)`.
 *
 * @param {object} quote     - Full LI.FI quote object
 * @returns {object} EXECUTE action
 */
function _buildExecuteAction(quote) {
  const tx = quote.transactionRequest;
  return {
    type: 'EXECUTE',
    chainId: Number(tx.chainId || quote.action?.fromChainId),
    transactionRequest: {
      // All fields LI.FI populates — pass them verbatim to the wallet
      to:       tx.to,
      data:     tx.data,
      value:    tx.value,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      // EIP-1559 fields (populated when the chain supports them)
      maxFeePerGas:         tx.maxFeePerGas        ?? null,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas ?? null,
    },
    // Estimated output for UI display
    estimate: {
      toAmount:          quote.estimate?.toAmount,
      toAmountMin:       quote.estimate?.toAmountMin,
      gasCosts:          quote.estimate?.gasCosts,
      executionDuration: quote.estimate?.executionDuration,
    },
    // Bridge / tool metadata for receipts and status polling
    toolDetails: {
      tool:     quote.tool,
      toolData: quote.toolData,
      bridge:   quote.includedSteps?.[0]?.toolDetails?.name ?? quote.tool,
    },
    description: `Execute bridge from ${quote.action?.fromChainId} → ${quote.action?.toChainId} via ${quote.tool}`,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ExecutionStep
 * @property {'APPROVE'|'EXECUTE'} type
 * @property {number}              chainId
 * @property {object}              [transactionRequest]  - Present on EXECUTE
 * @property {string}              [token]               - Present on APPROVE (token address)
 * @property {string}              [spender]             - Present on APPROVE (router address)
 * @property {string}              description
 */

/**
 * buildExecutionPlan(intent, fromAddress, options)
 *
 * Fetches a quote from LI.FI and returns an ordered ExecutionPlan array.
 *
 * Step 0 — APPROVE (omitted for native tokens)
 * Step 1 — EXECUTE
 *
 * The calling component should iterate over the plan and execute each step
 * sequentially, awaiting transaction confirmation before advancing.
 *
 * @param {import('./intentParser.js').BridgeIntent} intent
 *   Fully resolved intent from `parseBridgeIntent()`.
 *
 * @param {string} fromAddress
 *   The user's source-chain wallet address (connected wallet).
 *
 * @param {object} [options]
 * @param {string} [options.toTokenAddress]
 *   Address of the token to receive on the destination chain.
 *   Defaults to the native gas token (zero address) when omitted.
 *
 * @returns {Promise<ExecutionStep[]>} Ordered execution plan (1 or 2 steps).
 * @throws {Error} On routing failures, insufficient liquidity, or API errors.
 *
 * @example
 * const intent = await parseBridgeIntent('bridge 50 USDC from Ethereum to Polygon');
 * const plan = await buildExecutionPlan(intent, '0xYourWallet');
 *
 * for (const step of plan) {
 *   if (step.type === 'APPROVE') {
 *     const tx = await tokenContract.approve(step.spender, ethers.MaxUint256);
 *     await tx.wait();
 *   } else {
 *     const tx = await signer.sendTransaction(step.transactionRequest);
 *     await tx.wait();
 *   }
 * }
 */
export async function buildExecutionPlan(intent, fromAddress, options = {}) {
  if (!intent) throw new TypeError('[lifiAggregator] intent is required.');
  if (!fromAddress) throw new TypeError('[lifiAggregator] fromAddress is required.');
  if (intent.requiresDestAddress) {
    throw new Error('[lifiAggregator] Cross-VM route requires a destination address. Resolve requiresDestAddress before calling buildExecutionPlan.');
  }

  // ── Convert amount to smallest unit ────────────────────────────────────────
  const fromAmountSmallest = _toSmallestUnit(intent.amount, intent.tokenDecimals);

  const toAddress = intent.destinationAddress || fromAddress;
  const toToken   = options.toTokenAddress || NATIVE_TOKEN_ADDRESS;

  // ── Fetch the quote ─────────────────────────────────────────────────────────
  const quote = await _fetchQuote({
    fromChain:   intent.sourceChainId,
    toChain:     intent.destinationChainId,
    fromToken:   intent.tokenAddress,
    toToken,
    fromAmount:  fromAmountSmallest,
    fromAddress,
    toAddress:   toAddress !== fromAddress ? toAddress : null,
  });

  // Sanity-check: ensure LI.FI returned a usable transactionRequest
  if (!quote?.transactionRequest?.to) {
    throw new Error('[lifiAggregator] LI.FI returned an incomplete quote — missing transactionRequest.to.');
  }

  const plan = [];

  // ── Step 0: APPROVE (ERC-20 tokens only) ───────────────────────────────────
  if (!_isNativeToken(intent.tokenAddress)) {
    // LI.FI returns the router address that needs approval in `estimate.approvalAddress`
    const routerAddress = quote.estimate?.approvalAddress || quote.transactionRequest?.to;
    plan.push(_buildApproveAction(intent.tokenAddress, routerAddress, intent.sourceChainId, fromAmountSmallest));
  }

  // ── Step 1: EXECUTE ─────────────────────────────────────────────────────────
  plan.push(_buildExecuteAction(quote));

  return plan;
}

/**
 * getQuoteOnly(intent, fromAddress, options)
 *
 * Returns the raw LI.FI quote without building an execution plan.
 * Useful for displaying estimated output amounts and gas costs in the UI
 * before committing to execution.
 *
 * @param {import('./intentParser.js').BridgeIntent} intent
 * @param {string} fromAddress
 * @param {object} [options]
 * @param {string} [options.toTokenAddress]
 * @returns {Promise<object>} Raw LI.FI quote object
 */
export async function getQuoteOnly(intent, fromAddress, options = {}) {
  if (!intent || !fromAddress) throw new TypeError('[lifiAggregator] intent and fromAddress are required.');

  const fromAmountSmallest = _toSmallestUnit(intent.amount, intent.tokenDecimals);
  const toToken = options.toTokenAddress || NATIVE_TOKEN_ADDRESS;

  return _fetchQuote({
    fromChain:  intent.sourceChainId,
    toChain:    intent.destinationChainId,
    fromToken:  intent.tokenAddress,
    toToken,
    fromAmount: fromAmountSmallest,
    fromAddress,
    toAddress:  intent.destinationAddress || null,
  });
}
