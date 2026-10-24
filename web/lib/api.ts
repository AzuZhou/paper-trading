// Stand-in for a real backend: the account is saved in the browser's
// localStorage, so it only exists in this browser. Every function here is
// async and shaped like an API call, so a real backend can replace the
// insides of this file without touching the components.

import {
  type Account,
  buy,
  createAccount,
  sell,
  type TradeResult,
} from "@/lib/account";

const STORAGE_KEY = "paper-trading:account";

function load(): Account {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Account;
  } catch {
    // Storage blocked or data unreadable: start with a fresh account.
  }
  return createAccount();
}

function save(account: Account): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    // Storage blocked: the trade still works, it just won't be remembered.
  }
}

export async function getAccount(): Promise<Account> {
  return load();
}

// priceCents comes from the browser for now. In v2 the server decides the price.
export async function buyShares(
  symbol: string,
  quantity: number,
  priceCents: number,
): Promise<TradeResult> {
  const result = buy(load(), symbol, quantity, priceCents);
  if (result.ok) save(result.account);
  return result;
}

export async function sellShares(
  symbol: string,
  quantity: number,
  priceCents: number,
): Promise<TradeResult> {
  const result = sell(load(), symbol, quantity, priceCents);
  if (result.ok) save(result.account);
  return result;
}
