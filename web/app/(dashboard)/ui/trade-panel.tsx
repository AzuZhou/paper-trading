"use client";

import { type PointerEvent, useRef, useState } from "react";
import { useAccount } from "@/app/(dashboard)/providers/account-provider";
import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import { formatUsd } from "@/lib/format";

const CLOSE_MS = 200;
const DISMISS_DISTANCE = 100; // px dragged down before it counts as a dismiss

type Feedback = { ok: boolean; text: string };

type Props = {
  symbol: string | null;
  onClose: () => void;
};

export default function TradePanel({ symbol, onClose }: Props) {
  const latest = usePrices();
  const { account, trade } = useAccount();
  const [shares, setShares] = useState("1");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const startY = useRef(0);
  const moved = useRef(false);

  // Start fresh when a different stock is picked, or the panel closes.
  const [shownSymbol, setShownSymbol] = useState(symbol);
  if (symbol !== shownSymbol) {
    setShownSymbol(symbol);
    setShares("1");
    setFeedback(null);
    setDragY(0);
    setDragging(false);
    setClosing(false);
  }

  const priceCents = symbol && latest ? latest.prices[symbol] : undefined;

  if (!symbol || priceCents === undefined) {
    return (
      <aside
        aria-label="Trade"
        className="hidden rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 lg:flex lg:min-h-88 lg:items-center lg:justify-center"
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

  // Slide down first, then tell the parent to close.
  const dismiss = () => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    startY.current = event.clientY;
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const distance = Math.max(0, event.clientY - startY.current);
    if (distance > 5) moved.current = true;
    setDragY(distance);
  };

  const onPointerUp = () => {
    setDragging(false);
    if (dragY > DISMISS_DISTANCE) dismiss();
    else setDragY(0);
  };

  return (
    <aside
      aria-label="Trade"
      style={{
        transform: closing ? "translateY(100%)" : `translateY(${dragY}px)`,
      }}
      className={`fixed inset-x-0 bottom-0 z-10 animate-slide-up rounded-t-2xl border-t border-gray-200 bg-white p-4 pt-1 shadow-[0_-4px_16px_rgba(17,24,39,0.14)] motion-reduce:animate-none lg:static lg:min-h-88 lg:animate-none lg:rounded-xl lg:border lg:p-6 lg:shadow-none ${
        dragging ? "" : "transition-transform duration-200 ease-in"
      }`}
    >
      <div className="motion-reduce:animate-none lg:animate-fade-in-right">
        <button
          type="button"
          aria-label="Close trade panel"
          onClick={() => {
            if (!moved.current) dismiss();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            setDragging(false);
            setDragY(0);
          }}
          className="flex h-9 w-full touch-none items-center justify-center lg:hidden"
        >
          <span className="h-1 w-9 rounded-full bg-gray-300" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">{symbol}</div>
          <div className="ml-auto tabular-nums">
            {formatUsd(priceCents)}{" "}
            <span className="text-xs text-gray-600">per share</span>
          </div>
        </div>

        <form action={() => submit("buy")}>
          <div className="mt-3 lg:mt-5">
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

          <dl className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-sm lg:mt-4">
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

          <div className="mt-4 flex gap-3 lg:mt-5">
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
      </div>
    </aside>
  );
}
