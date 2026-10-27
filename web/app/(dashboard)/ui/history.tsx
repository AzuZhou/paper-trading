"use client";

import Link from "next/link";
import { useAccount } from "@/app/(dashboard)/providers/account-provider";
import { formatUsd } from "@/lib/format";

export default function History() {
  const { account } = useAccount();

  if (!account) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  // Trades are only ever added at the end, so a trade's position never changes.
  // Newest first for display.
  const rows = account.trades
    .map((trade, position) => ({ trade, position }))
    .reverse();

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <h2 className="p-4 text-base font-semibold">Trade history</h2>
      {rows.length === 0 ? (
        <p className="border-t border-gray-200 p-4 text-sm text-gray-600">
          No trades yet. Make one on the{" "}
          <Link href="/" className="font-medium text-blue-700 underline">
            Market
          </Link>{" "}
          tab.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Your trades, newest first</caption>
            <thead>
              <tr className="border-y border-gray-200 text-xs text-gray-600">
                <th scope="col" className="px-4 py-2.5 text-left font-medium">
                  Side
                </th>
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
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ trade, position }) => (
                <tr
                  key={position}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        trade.side === "buy"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trade.side === "buy" ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <th scope="row" className="px-4 py-3 text-left font-semibold">
                    {trade.symbol}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {trade.quantity}
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                    {formatUsd(trade.priceCents)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatUsd(trade.quantity * trade.priceCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
