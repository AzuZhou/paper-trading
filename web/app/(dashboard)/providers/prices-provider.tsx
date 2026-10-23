"use client";

import { createContext, useContext, useEffect, useState } from "react";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

type PricesMessage = {
  type: "prices";
  seq: number;
  ts: number;
  prices: Record<string, number>; // symbol -> price in cents
};

const PricesContext = createContext<PricesMessage | null>(null);

export function PricesProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <PricesContext.Provider value={latest}>{children}</PricesContext.Provider>
  );
}

// The latest prices message, or null until the first one arrives.
export function usePrices(): PricesMessage | null {
  return useContext(PricesContext);
}
