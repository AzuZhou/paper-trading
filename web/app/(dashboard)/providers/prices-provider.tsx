"use client";

import { createContext, useContext, useEffect, useState } from "react";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10_000;

type PricesMessage = {
  type: "prices";
  seq: number;
  ts: number;
  prices: Record<string, number>; // symbol -> price in cents
};

const PricesContext = createContext<PricesMessage | null>(null);
const ReconnectingContext = createContext(false);

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [latest, setLatest] = useState<PricesMessage | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let socket: WebSocket | undefined;
    let timer: number | undefined;
    let retryMs = FIRST_RETRY_MS;
    let lastSeq = -1;

    const connect = () => {
      socket = new WebSocket(REALTIME_URL);

      socket.onopen = () => {
        retryMs = FIRST_RETRY_MS;
        lastSeq = -1; // a new connection may be a restarted server
        setReconnecting(false);
      };

      socket.onmessage = (event) => {
        const message: PricesMessage = JSON.parse(event.data);
        // Ignore anything older than what this connection already showed.
        if (message.seq <= lastSeq) return;
        lastSeq = message.seq;
        setLatest(message);
      };

      socket.onclose = () => {
        setReconnecting(true);
        timer = window.setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
      };
    };

    connect();

    return () => {
      window.clearTimeout(timer);
      if (socket) {
        socket.onclose = null; // closing on purpose is not a disconnect
        socket.close();
      }
    };
  }, []);

  return (
    <PricesContext.Provider value={latest}>
      <ReconnectingContext.Provider value={reconnecting}>
        {children}
      </ReconnectingContext.Provider>
    </PricesContext.Provider>
  );
}

// The latest prices message, or null until the first one arrives.
export function usePrices(): PricesMessage | null {
  return useContext(PricesContext);
}

// True while the connection is closed and we are trying again.
export function useReconnecting(): boolean {
  return useContext(ReconnectingContext);
}
