"use client";

import { useState } from "react";
import Prices from "@/app/(dashboard)/ui/prices";
import TradePanel from "@/app/(dashboard)/ui/trade-panel";

export default function Market() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      className={`flex flex-col gap-6 lg:flex-row lg:items-start ${
        selected ? "pb-96 lg:pb-0" : ""
      }`}
    >
      <div className="min-w-0 lg:flex-3">
        <Prices
          selected={selected}
          onSelect={(symbol) =>
            setSelected(symbol === selected ? null : symbol)
          }
        />
      </div>
      <div className="lg:flex-2">
        <TradePanel symbol={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
