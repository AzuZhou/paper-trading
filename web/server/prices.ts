import "server-only";

const url = process.env.REALTIME_URL;
if (!url) throw new Error("REALTIME_URL is not set");

// Asks realtime for the current price of a symbol, in cents.
// Returns null when realtime doesn't know the symbol.
export async function getPriceCents(symbol: string): Promise<number | null> {
  const response = await fetch(
    `${url}/price?symbol=${encodeURIComponent(symbol)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Price request failed: ${response.status}`);

  const data = await response.json();
  if (typeof data.priceCents !== "number") {
    throw new Error("Price response was not a number");
  }
  return data.priceCents;
}
