"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type ConnectionStatus,
  createPriceConnection,
} from "@/lib/price-connection";
import type { PricesMessage } from "@/lib/prices-message";

const PricesContext = createContext<PricesMessage | null>(null);
const ConnectionContext = createContext<ConnectionStatus>("connecting");

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [latest, setLatest] = useState<PricesMessage | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const connection = createPriceConnection({
      setLatest,
      setConnectionStatus,
    });

    return connection.stop;
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

export function useConnectionContext(): ConnectionStatus {
  return useContext(ConnectionContext);
}
