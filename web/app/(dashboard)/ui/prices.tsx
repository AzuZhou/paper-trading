"use client";

import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/format";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

type PricesMessage = {
  type: "prices";
  seq: number;
  ts: number;
  prices: Record<string, number>; // symbol -> price in cents
};

export default function Prices() {
  const [latest, setLatest] = useState<PricesMessage | null>(null);

  useEffect(() => {
    const socket = new WebSocket(REALTIME_URL);
    socket.onmessage = (event) => {
      const message: PricesMessage = JSON.parse(event.data);
      // Ignore anything older than what is already shown.
      // TODO: with auto-reconnect, reset the saved seq on each new connection.
      setLatest((current) =>
        current && message.seq <= current.seq ? current : message,
      );
    };
    return () => socket.close();
  }, []);

  if (!latest) return <p>Connecting</p>;

  return (
    <table className="w-full text-left">
      <caption className="mb-2 text-left text-sm text-zinc-500">
        Simulated prices
      </caption>
      <thead>
        <tr className="border-b border-zinc-300 dark:border-zinc-700">
          <th scope="col" className="py-2 font-medium">
            Symbol
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Price
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(latest.prices).map(([symbol, cents]) => (
          <tr
            key={symbol}
            className="border-b border-zinc-200 dark:border-zinc-800"
          >
            <th scope="row" className="py-2 font-medium">
              {symbol}
            </th>
            <td className="py-2 text-right tabular-nums">{formatUsd(cents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
