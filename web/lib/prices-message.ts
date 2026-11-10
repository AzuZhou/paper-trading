export type PricesMessage = {
  type: "prices";
  seq: number;
  ts: number;
  prices: Record<string, number>; // symbol -> price in cents
};

export function isValidPricesMessage(value: unknown): value is PricesMessage {
  if (typeof value !== "object" || value === null) return false;

  const { type, seq, prices } = value as {
    type?: unknown;
    seq?: unknown;
    prices?: unknown;
  };

  if (type !== "prices") return false;
  if (typeof seq !== "number") return false;
  if (typeof prices !== "object" || prices === null) return false;
  if (Array.isArray(prices)) return false;

  const priceValues = Object.values(prices);

  return (
    priceValues.length > 0 &&
    priceValues.every((price) => typeof price === "number")
  );
}
