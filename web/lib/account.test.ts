import { describe, expect, it } from "vitest";
import {
  type Account,
  buy,
  costBasisCents,
  createAccount,
  holdingsValueCents,
  positionGainCents,
  STARTING_CASH_CENTS,
  sell,
  type TradeResult,
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

function must(result: TradeResult): Account {
  if (!result.ok) throw new Error(result.error);
  return result.account;
}

describe("costBasisCents", () => {
  it("adds up what you paid for the shares you hold", () => {
    let account = createAccount();
    account = must(buy(account, "AAPL", 10, 10000));
    account = must(buy(account, "AAPL", 10, 20000));
    expect(costBasisCents(account, "AAPL")).toBe(300000);
  });

  it("removes sold shares at their average cost", () => {
    let account = createAccount();
    account = must(buy(account, "AAPL", 10, 10000));
    account = must(buy(account, "AAPL", 10, 20000));
    account = must(sell(account, "AAPL", 10, 30000));
    expect(costBasisCents(account, "AAPL")).toBe(150000);
  });

  it("is 0 after selling everything", () => {
    let account = createAccount();
    account = must(buy(account, "AAPL", 10, 10000));
    account = must(sell(account, "AAPL", 10, 12000));
    expect(costBasisCents(account, "AAPL")).toBe(0);
  });
});

describe("positionGainCents", () => {
  it("is value now minus what you paid", () => {
    let account = createAccount();
    account = must(buy(account, "AAPL", 5, 10000));
    account = must(buy(account, "AAPL", 2, 13000));
    // paid 76000 for 7 shares, now worth 7 * 12000 = 84000
    expect(positionGainCents(account, "AAPL", 12000)).toBe(8000);
  });

  it("is negative when the price fell", () => {
    const account = must(buy(createAccount(), "AAPL", 10, 10000));
    expect(positionGainCents(account, "AAPL", 9000)).toBe(-10000);
  });

  it("is 0 for a stock you don't hold", () => {
    expect(positionGainCents(createAccount(), "AAPL", 12000)).toBe(0);
  });
});
