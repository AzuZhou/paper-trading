"use client";

import Link from "next/link";
import { useAccount } from "@/app/(dashboard)/providers/account-provider";
import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import { positionGainCents } from "@/lib/account";
import { formatGain, formatUsd } from "@/lib/format";

export default function Portfolio() {
  const { account } = useAccount();
  const prices = usePrices();

  if (!account) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  const holdings = Object.entries(account.holdings);

  return (
    <section className="overflow-hidden border-y border-gray-200 bg-white lg:rounded-xl lg:border">
      <h2 className="p-4 text-base font-semibold">Holdings</h2>
      {holdings.length === 0 ? (
        <p className="border-t border-gray-200 p-4 text-sm text-gray-600">
          You don't own any shares yet. Pick a stock on the{" "}
          <Link href="/" className="font-medium text-blue-700 underline">
            Market
          </Link>{" "}
          tab.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Shares you own</caption>
            <thead>
              <tr className="border-y border-gray-200 text-xs text-gray-600">
                <th scope="col" className="px-4 py-2.5 text-left font-medium">
                  Symbol
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Shares
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-2.5 text-right font-medium sm:table-cell"
                >
                  Price
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Value
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Gain / loss
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(([symbol, shares]) => {
                const price = prices?.prices[symbol];
                const valueCents = price === undefined ? null : shares * price;
                const gainCents =
                  price === undefined
                    ? null
                    : positionGainCents(account, symbol, price);
                const gainColor =
                  gainCents === null || gainCents === 0
                    ? "text-gray-900"
                    : gainCents > 0
                      ? "text-emerald-700"
                      : "text-red-700";

                return (
                  <tr
                    key={symbol}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-semibold"
                    >
                      {symbol}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {shares}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                      {price === undefined ? "—" : formatUsd(price)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {valueCents === null ? "—" : formatUsd(valueCents)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${gainColor}`}
                    >
                      {gainCents === null ? "—" : formatGain(gainCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
