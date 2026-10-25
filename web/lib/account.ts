// All money is in cents (whole numbers), like the prices from the realtime service.

export type Trade = {
  side: "buy" | "sell";
  symbol: string;
  quantity: number;
  priceCents: number;
};

export type Account = {
  cashCents: number;
  holdings: Record<string, number>; // symbol -> shares owned
  trades: Trade[];
};

export const STARTING_CASH_CENTS = 10_000_000; // $100,000.00

export function createAccount(): Account {
  return { cashCents: STARTING_CASH_CENTS, holdings: {}, trades: [] };
}

export type TradeResult =
  | { ok: true; account: Account }
  | { ok: false; error: string };

// Returns a message if the quantity or price is not allowed, otherwise null.
function checkOrder(quantity: number, priceCents: number): string | null {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return "Quantity must be a whole number above zero.";
  }
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    return "Invalid price.";
  }
  return null;
}

// Both buy and sell return a new account. The one passed in is never changed.
export function buy(
  account: Account,
  symbol: string,
  quantity: number,
  priceCents: number,
): TradeResult {
  const problem = checkOrder(quantity, priceCents);
  if (problem) return { ok: false, error: problem };

  const costCents = quantity * priceCents;
  if (costCents > account.cashCents) {
    return { ok: false, error: "Not enough cash." };
  }
  return {
    ok: true,
    account: {
      cashCents: account.cashCents - costCents,
      holdings: {
        ...account.holdings,
        [symbol]: (account.holdings[symbol] ?? 0) + quantity,
      },
      trades: [
        ...account.trades,
        { side: "buy", symbol, quantity, priceCents },
      ],
    },
  };
}

export function sell(
  account: Account,
  symbol: string,
  quantity: number,
  priceCents: number,
): TradeResult {
  const problem = checkOrder(quantity, priceCents);
  if (problem) return { ok: false, error: problem };

  const owned = account.holdings[symbol] ?? 0;
  if (quantity > owned) {
    return { ok: false, error: "Not enough shares." };
  }
  const holdings = { ...account.holdings };
  if (owned === quantity) {
    delete holdings[symbol]; // sold all of it, so remove the entry
  } else {
    holdings[symbol] = owned - quantity;
  }
  return {
    ok: true,
    account: {
      cashCents: account.cashCents + quantity * priceCents,
      holdings,
      trades: [
        ...account.trades,
        { side: "sell", symbol, quantity, priceCents },
      ],
    },
  };
}

// What all held shares are worth at the given prices (in cents).
// Returns null if we hold a symbol that has no price yet.
export function holdingsValueCents(
  account: Account,
  prices: Record<string, number>,
): number | null {
  let total = 0;
  for (const [symbol, shares] of Object.entries(account.holdings)) {
    const price = prices[symbol];
    if (price === undefined) return null;
    total += shares * price;
  }
  return total;
}

// What you paid for the shares of `symbol` you still hold (in cents).
// A sale removes shares at their average cost.
export function costBasisCents(account: Account, symbol: string): number {
  let shares = 0;
  let cost = 0;
  for (const trade of account.trades) {
    if (trade.symbol !== symbol) continue;
    if (trade.side === "buy") {
      shares += trade.quantity;
      cost += trade.quantity * trade.priceCents;
    } else {
      cost -= (cost / shares) * trade.quantity;
      shares -= trade.quantity;
    }
  }
  return Math.round(cost);
}
