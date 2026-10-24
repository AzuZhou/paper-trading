"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Account, TradeResult } from "@/lib/account";
import { buyShares, getAccount, sellShares } from "@/lib/api";

type AccountContextValue = {
  account: Account | null; // null until the saved account has loaded
  trade: (
    side: "buy" | "sell",
    symbol: string,
    quantity: number,
    priceCents: number,
  ) => Promise<TradeResult>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    getAccount().then(setAccount);
  }, []);

  async function trade(
    side: "buy" | "sell",
    symbol: string,
    quantity: number,
    priceCents: number,
  ): Promise<TradeResult> {
    const result =
      side === "buy"
        ? await buyShares(symbol, quantity, priceCents)
        : await sellShares(symbol, quantity, priceCents);
    if (result.ok) setAccount(result.account);
    return result;
  }

  return (
    <AccountContext.Provider value={{ account, trade }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount must be used inside AccountProvider");
  return value;
}
