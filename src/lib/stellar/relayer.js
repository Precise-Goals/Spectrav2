
/**
 * Intercepts a signed user transaction and wraps it in a Fee-Bump Transaction
 * paid by the application's treasury account.
 */
export async function submitRelayedTransaction(signedXdr) {
  const response = await fetch('/api/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedXdr }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Relayer Error: ${errorData.error || response.statusText}`);
  }

  return await response.json();
}
