"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isValidPricesMessage, type PricesMessage } from "@/lib/prices-message";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10_000;
const GIVE_UP_MS = 2 * 60 * 1000;

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
    let retryTimer: number | undefined;
    let giveUpTimer: number | undefined;
    let retryMs = FIRST_RETRY_MS;
    let lastSeq = -1;

    const giveUp = () => {
      window.clearTimeout(retryTimer);

      if (socket) {
        socket.onclose = null; // closing on purpose is not a disconnect
        socket.close();
      }
      setConnectionStatus("unavailable");
    };

    const startGiveUpTimer = () => {
      // starts the countdown and saves the id in the variable
      if (giveUpTimer) return; // already running
      giveUpTimer = window.setTimeout(giveUp, GIVE_UP_MS);
    };

    const stopGiveUpTimer = () => {
      // cancels the countdown and empties the variable
      window.clearTimeout(giveUpTimer);
      giveUpTimer = undefined;
    };

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
        stopGiveUpTimer();
        retryMs = FIRST_RETRY_MS;
        setConnectionStatus("live");
        setLatest(message);
      };

      socket.onclose = () => {
        setLatest(null);
        setConnectionStatus((current) =>
          current === "live" ? "reconnecting" : current,
        );
        startGiveUpTimer(); // this must always be the reconnecting case
        retryTimer = window.setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
      };
    };

    connect();
    startGiveUpTimer();

    return () => {
      window.clearTimeout(giveUpTimer);
      window.clearTimeout(retryTimer);
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
