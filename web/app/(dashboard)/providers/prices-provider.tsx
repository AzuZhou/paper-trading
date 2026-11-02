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
const DisconnectedContext = createContext(false);

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [latest, setLatest] = useState<PricesMessage | null>(null);
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(REALTIME_URL);
    socket.onopen = () => setDisconnected(false);
    socket.onmessage = (event) => {
      const message: PricesMessage = JSON.parse(event.data);
      // Ignore anything older than what is already shown.
      // TODO: with auto-reconnect, reset the saved seq on each new connection.
      setLatest((current) =>
        current && message.seq <= current.seq ? current : message,
      );
    };
    socket.onclose = () => setDisconnected(true);
    return () => {
      socket.onclose = null; // closing on purpose is not a disconnect
      socket.close();
    };
  }, []);

  return (
    <PricesContext.Provider value={latest}>
      <DisconnectedContext.Provider value={disconnected}>
        {children}
      </DisconnectedContext.Provider>
    </PricesContext.Provider>
  );
}

// The latest prices message, or null until the first one arrives.
export function usePrices(): PricesMessage | null {
  return useContext(PricesContext);
}

// True once the connection has closed, for example when the server sleeps.
export function useDisconnected(): boolean {
  return useContext(DisconnectedContext);
}
