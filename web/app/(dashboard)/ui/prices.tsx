"use client";

import {
  type ConnectionStatus,
  useConnectionContext,
  usePrices,
} from "@/app/(dashboard)/providers/prices-provider";
import Skeleton from "@/app/(dashboard)/ui/skeleton";
import { formatUsd } from "@/lib/format";

const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f"];

const BADGES: Record<ConnectionStatus, { text: string; style: string }> = {
  connecting: { text: "Connecting", style: "bg-gray-100 text-gray-700" },
  live: { text: "Live", style: "bg-emerald-50 text-emerald-800" },
  reconnecting: { text: "Reconnecting", style: "bg-amber-50 text-amber-800" },
  unavailable: { text: "Unavailable", style: "bg-red-50 text-red-700" },
};

const MESSAGES: Record<Exclude<ConnectionStatus, "live">, string> = {
  connecting:
    "Connecting to the price server. If it was asleep, this can take up to a minute.",
  reconnecting:
    "The price connection closed. Trying to reconnect. The server can take up to a minute to wake up.",
  unavailable: "Something isn't working. Please try again later.",
};

type Props = {
  selected: string | null;
  onSelect: (symbol: string) => void;
};

export default function Prices({ selected, onSelect }: Props) {
  const latest = usePrices();
  const status = useConnectionContext() ?? "connecting";
  const badge = BADGES[status];

  return (
    <section className="overflow-hidden border-y border-gray-200 bg-white lg:rounded-xl lg:border">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-base font-semibold">Market</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.style}`}
        >
          {badge.text}
        </span>
      </div>
      {status !== "live" && (
        <output className="block px-4 pb-3 text-sm text-gray-600">
          {MESSAGES[status]}
        </output>
      )}
      {status !== "unavailable" && (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Simulated prices</caption>
          <thead>
            <tr className="border-y border-gray-200 text-xs text-gray-600">
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                Symbol
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(latest?.prices || {}).map(([symbol, cents]) => {
              const isSelected = symbol === selected;
              return (
                <tr
                  key={symbol}
                  className={`border-b border-gray-100 last:border-b-0 ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <th scope="row" className="px-4 text-left">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(symbol)}
                      className="h-12 font-semibold"
                    >
                      {symbol}
                    </button>
                  </th>
                  <td className="px-4 text-right tabular-nums">
                    {formatUsd(cents)}
                  </td>
                </tr>
              );
            })}
            {!latest &&
              SKELETON_ROWS.map((key) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="h-12 px-4">
                    <Skeleton className="h-4 w-18" />
                  </td>
                  <td className="h-12 px-4">
                    <Skeleton className="ml-auto h-4 w-18" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
