"use client";

import { useState } from "react";
import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import { formatUsd } from "@/lib/format";

export default function TradePanel({ symbol }: { symbol: string | null }) {
  const latest = usePrices();
  const [shares, setShares] = useState("1");

  const priceCents = symbol && latest ? latest.prices[symbol] : undefined;

  if (!symbol || priceCents === undefined) {
    return (
      <aside
        aria-label="Trade"
        className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600"
      >
        Select a stock to trade.
      </aside>
    );
  }

  const quantity = Number(shares);
  const totalCents =
    Number.isInteger(quantity) && quantity > 0 ? quantity * priceCents : 0;

  return (
    <aside
      aria-label="Trade"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{symbol}</div>
        <div className="tabular-nums">
          {formatUsd(priceCents)}{" "}
          <span className="text-xs text-gray-600">per share</span>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="shares" className="text-sm font-medium">
          Shares
        </label>
        <input
          id="shares"
          type="number"
          min={1}
          step={1}
          value={shares}
          onChange={(event) => setShares(event.target.value)}
          className="mt-1.5 block h-11 w-full rounded-lg border border-gray-400 px-3"
        />
      </div>

      <dl className="mt-4 flex justify-between text-sm">
        <dt className="text-gray-600">Estimated total</dt>
        <dd className="font-semibold tabular-nums">{formatUsd(totalCents)}</dd>
      </dl>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          className="h-12 flex-1 rounded-lg bg-blue-600 font-semibold text-white"
        >
          Buy
        </button>
        <button
          type="button"
          className="h-12 flex-1 rounded-lg border border-gray-400 bg-white font-semibold"
        >
          Sell
        </button>
      </div>
    </aside>
  );
}
