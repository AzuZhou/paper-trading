// A price is stored in cents (a whole number), so there are no decimal bugs.
// Example: { AAPL: 18940 } means Apple costs $189.40.
export type Prices = Record<string, number>;

// The most a price can move in one tick: 0.5%.
const MAX_STEP = 0.005;

// Takes the current prices and returns the next ones.
// `random` gives a number from 0 up to 1. Tests pass in a fake one.
export function nextPrices(
  current: Prices,
  random: () => number = Math.random,
): Prices {
  const updated: Prices = {};
  for (const [symbol, cents] of Object.entries(current)) {
    const shock = random() * 2 - 1; // a number from -1 to 1
    const change = Math.round(cents * MAX_STEP * shock);
    updated[symbol] = cents + change;
  }
  return updated;
}
