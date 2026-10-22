import { describe, expect, it } from "vitest";
import { buy, createAccount, STARTING_CASH_CENTS } from "./account";

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
