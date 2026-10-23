const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUsd(cents: number): string {
  return usd.format(cents / 100);
}

// Always shows a sign, so a gain never relies on color alone.
export function formatGain(cents: number): string {
  const sign = cents > 0 ? "+" : cents < 0 ? "−" : "";
  return sign + usd.format(Math.abs(cents) / 100);
}
