"use client";

import { useState } from "react";
import { useAccount } from "@/app/(dashboard)/providers/account-provider";
import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import { formatUsd } from "@/lib/format";

type Feedback = { ok: boolean; text: string };

export default function TradePanel({ symbol }: { symbol: string | null }) {
  const latest = usePrices();
  const { account, trade } = useAccount();
  const [shares, setShares] = useState("1");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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
  const owned = account?.holdings[symbol] ?? 0;

  const submit = async (side: "buy" | "sell") => {
    const result = await trade(side, symbol, quantity, priceCents);
    if (result.ok) {
      const verb = side === "buy" ? "Bought" : "Sold";
      setFeedback({
        ok: true,
        text: `${verb} ${quantity} ${symbol} at ${formatUsd(priceCents)}.`,
      });
    } else {
      setFeedback({ ok: false, text: result.error });
    }
  };

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

      <form action={() => submit("buy")}>
        <div className="mt-5">
          <label htmlFor="shares" className="text-sm font-medium">
            Shares
          </label>
          <input
            id="shares"
            name="shares"
            type="number"
            min={1}
            step={1}
            value={shares}
            onChange={(event) => setShares(event.target.value)}
            className="mt-1.5 block h-11 w-full rounded-lg border border-gray-400 px-3"
          />
        </div>

        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-2 text-sm">
          <dt className="text-gray-600">Estimated total</dt>
          <dd className="text-right font-semibold tabular-nums">
            {formatUsd(totalCents)}
          </dd>
          <dt className="text-gray-600">Cash available</dt>
          <dd className="text-right tabular-nums">
            {account ? formatUsd(account.cashCents) : "—"}
          </dd>
          <dt className="text-gray-600">You own</dt>
          <dd className="text-right tabular-nums">
            {owned === 1 ? "1 share" : `${owned} shares`}
          </dd>
        </dl>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={!account}
            className="h-12 flex-1 rounded-lg bg-blue-600 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy
          </button>
          <button
            type="submit"
            formAction={() => submit("sell")}
            disabled={owned === 0}
            className="h-12 flex-1 rounded-lg border border-gray-400 bg-white font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sell
          </button>
        </div>
      </form>

      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${
          feedback?.ok ? "text-emerald-800" : "text-red-700"
        }`}
      >
        {feedback?.text}
      </p>
    </aside>
  );
}
