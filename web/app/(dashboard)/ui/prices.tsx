"use client";

import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import { formatUsd } from "@/lib/format";

type Props = {
  selected: string | null;
  onSelect: (symbol: string) => void;
};

export default function Prices({ selected, onSelect }: Props) {
  const latest = usePrices();

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-base font-semibold">Market</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            latest
              ? "bg-emerald-50 text-emerald-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {latest ? "Live" : "Connecting"}
        </span>
      </div>
      {latest && (
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
            {Object.entries(latest.prices).map(([symbol, cents]) => {
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
          </tbody>
        </table>
      )}
    </section>
  );
}
