/**
 * registryService.js
 *
 * Dynamic chain + token registry backed by the LI.FI public API.
 *
 * Ponytail: Skipped a local JSON fixture; the LI.FI /v1/chains and /v1/tokens
 * endpoints are free and CORS-safe from Node environments. A simple in-process
 * Map cache with a 10-minute TTL is all we need — no Redis/Upstash dependency.
 */

const LIFI_BASE = 'https://li.quest/v1';

// ── In-process cache ──────────────────────────────────────────────────────────
// Each entry: { data, expiresAt (epoch ms) }
const _cache = new Map();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function _isFresh(key) {
  const entry = _cache.get(key);
  return entry && entry.expiresAt > Date.now();
}

function _set(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

function _get(key) {
  return _cache.get(key)?.data ?? null;
}

// ── Internal fetch helper ──────────────────────────────────────────────────────
async function _apiFetch(path, params = {}) {
  const url = new URL(`${LIFI_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LI.FI API error [${res.status}] for ${path}: ${body}`);
  }

  return res.json();
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * getSupportedChains()
 *
 * Returns the full list of chains LI.FI supports. Each entry includes:
 *   id (number), key (string), name (string), chainType ("EVM" | "SVM" | "UTXO" | etc.)
 *
 * @returns {Promise<Array<{id:number, key:string, name:string, chainType:string}>>}
 */
export async function getSupportedChains() {
  const CACHE_KEY = 'chains';
  if (_isFresh(CACHE_KEY)) return _get(CACHE_KEY);

  const json = await _apiFetch('/chains');
  const chains = json.chains ?? [];
  _set(CACHE_KEY, chains);
  return chains;
}

/**
 * getSupportedTokens(chainId?)
 *
 * Returns tokens, optionally filtered to a single chain.
 * The registry is a flat array keyed by { chainId, symbol, address }.
 *
 * @param {number|string} [chainId]  LI.FI numeric chain id (optional)
 * @returns {Promise<Array<{chainId:number, symbol:string, address:string, decimals:number, name:string}>>}
 */
export async function getSupportedTokens(chainId) {
  const CACHE_KEY = `tokens:${chainId ?? 'all'}`;
  if (_isFresh(CACHE_KEY)) return _get(CACHE_KEY);

  const params = chainId ? { chains: String(chainId) } : {};
  const json = await _apiFetch('/tokens', params);

  // LI.FI returns tokens as { tokens: { [chainId]: Token[] } }
  const tokenMap = json.tokens ?? {};
  const flat = Object.values(tokenMap).flat();
  _set(CACHE_KEY, flat);
  return flat;
}

/**
 * resolveChain(nameOrId)
 *
 * Fuzzy-resolve a chain by name, key, or numeric id.
 * Case-insensitive. Returns null if not found.
 *
 * @param {string|number} nameOrId
 * @returns {Promise<Object|null>}
 */
export async function resolveChain(nameOrId) {
  const chains = await getSupportedChains();
  const needle = String(nameOrId).toLowerCase();
  return (
    chains.find(
      (c) =>
        String(c.id) === needle ||
        c.key?.toLowerCase() === needle ||
        c.name?.toLowerCase().includes(needle)
    ) ?? null
  );
}

/**
 * resolveToken(symbol, chainId)
 *
 * Find a token by symbol on a specific chain. Case-insensitive.
 *
 * @param {string} symbol
 * @param {number} chainId
 * @returns {Promise<Object|null>}
 */
export async function resolveToken(symbol, chainId) {
  const tokens = await getSupportedTokens(chainId);
  const needle = symbol.toLowerCase();
  return tokens.find((t) => t.symbol?.toLowerCase() === needle) ?? null;
}

/**
 * isEvmChain(chain)
 *
 * Returns true if the chain object is EVM-compatible.
 *
 * @param {{ chainType: string }} chain
 */
export function isEvmChain(chain) {
  return chain?.chainType === 'EVM';
}
