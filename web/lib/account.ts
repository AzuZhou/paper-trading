// All money is in cents (whole numbers), like the prices from the realtime service.

export type Trade = {
  side: "buy";
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

export type BuyResult =
  | { ok: true; account: Account }
  | { ok: false; error: string };

// Returns a new account. The one passed in is never changed.
export function buy(
  account: Account,
  symbol: string,
  quantity: number,
  priceCents: number,
): BuyResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "Quantity must be a whole number above zero." };
  }
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    return { ok: false, error: "Invalid price." };
  }
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
