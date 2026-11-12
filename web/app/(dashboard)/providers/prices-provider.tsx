"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isValidPricesMessage, type PricesMessage } from "@/lib/prices-message";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10_000;

export type ConnectionStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "unavailable";

const PricesContext = createContext<PricesMessage | null>(null);
const ConnectionContext = createContext<ConnectionStatus>("connecting");

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [latest, setLatest] = useState<PricesMessage | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  useEffect(() => {
    let socket: WebSocket | undefined;
    let timer: number | undefined;
    let retryMs = FIRST_RETRY_MS;
    let lastSeq = -1;

    const connect = () => {
      socket = new WebSocket(REALTIME_URL);

      socket.onopen = () => {
        lastSeq = -1; // a new connection may be a restarted server
      };

      socket.onmessage = (event) => {
        let message: unknown;
        try {
          message = JSON.parse(event.data);
        } catch {
          return; // not JSON, ignore it
        }
        if (!isValidPricesMessage(message)) return;
        // Ignore anything older than what this connection already showed.
        if (message.seq <= lastSeq) return;
        lastSeq = message.seq;
        // A message proves the connection is healthy. A server that accepts
        // and then closes right away (for example when it is full) never
        // gets here, so the state stays steady and the delay keeps growing.
        retryMs = FIRST_RETRY_MS;
        setConnectionStatus("live");
        setLatest(message);
      };

      socket.onclose = () => {
        setLatest(null);
        setConnectionStatus((current) =>
          current === "live" ? "reconnecting" : current,
        );
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
      <ConnectionContext.Provider value={connectionStatus}>
        {children}
      </ConnectionContext.Provider>
    </PricesContext.Provider>
  );
}

// The latest prices message, or null until the first one arrives.
export function usePrices(): PricesMessage | null {
  return useContext(PricesContext);
}

// True while the connection is closed and we are trying again.
export function useConnectionContext(): ConnectionStatus {
  return useContext(ConnectionContext);
}
