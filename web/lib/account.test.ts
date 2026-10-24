import { describe, expect, it } from "vitest";
import {
  buy,
  createAccount,
  holdingsValueCents,
  STARTING_CASH_CENTS,
  sell,
} from "./account";

describe("buy", () => {
  it("takes the exact cost from cash and adds the shares", () => {
    const result = buy(createAccount(), "AAPL", 10, 18940);
    expect(result).toEqual({
      ok: true,
      account: {
        cashCents: STARTING_CASH_CENTS - 189400,
        holdings: { AAPL: 10 },
        trades: [
          { side: "buy", symbol: "AAPL", quantity: 10, priceCents: 18940 },
        ],
      },
    });
  });

  it("refuses when there is not enough cash", () => {
    const result = buy(createAccount(), "AAPL", 1, STARTING_CASH_CENTS + 1);
    expect(result).toEqual({ ok: false, error: "Not enough cash." });
  });

  it("refuses a quantity that is not a whole number above zero", () => {
    for (const quantity of [0, -1, 1.5, Number.NaN]) {
      expect(buy(createAccount(), "AAPL", quantity, 18940).ok).toBe(false);
    }
  });
});

describe("sell", () => {
  it("turns shares into cash at the sell price", () => {
    const bought = buy(createAccount(), "AAPL", 10, 18940);
    if (!bought.ok) throw new Error("buy should work");
    const result = sell(bought.account, "AAPL", 4, 19000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.account.cashCents).toBe(
        STARTING_CASH_CENTS - 189400 + 4 * 19000,
      );
      expect(result.account.holdings).toEqual({ AAPL: 6 });
    }
  });

  it("refuses to sell shares you do not own", () => {
    const bought = buy(createAccount(), "AAPL", 10, 18940);
    if (!bought.ok) throw new Error("buy should work");
    expect(sell(bought.account, "AAPL", 11, 18940)).toEqual({
      ok: false,
      error: "Not enough shares.",
    });
    expect(sell(bought.account, "MSFT", 1, 42010).ok).toBe(false);
  });

  it("removes the holding when you sell all of it", () => {
    const bought = buy(createAccount(), "AAPL", 10, 18940);
    if (!bought.ok) throw new Error("buy should work");
    const result = sell(bought.account, "AAPL", 10, 18940);
    expect(result.ok && result.account.holdings).toEqual({});
  });
});

describe("holdingsValueCents", () => {
  it("adds up shares times current price", () => {
    const bought = buy(createAccount(), "AAPL", 10, 18940);
    if (!bought.ok) throw new Error("setup failed");
    expect(holdingsValueCents(bought.account, { AAPL: 19120 })).toBe(191200);
  });

  it("is 0 with no holdings", () => {
    expect(holdingsValueCents(createAccount(), {})).toBe(0);
  });

  it("is null when a price is missing", () => {
    const bought = buy(createAccount(), "AAPL", 10, 18940);
    if (!bought.ok) throw new Error("setup failed");
    expect(holdingsValueCents(bought.account, {})).toBeNull();
  });
});
