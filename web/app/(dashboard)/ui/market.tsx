"use client";

import { useState } from "react";
import Prices from "@/app/(dashboard)/ui/prices";
import TradePanel from "@/app/(dashboard)/ui/trade-panel";

export default function Market() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 lg:flex-3">
        <Prices selected={selected} onSelect={setSelected} />
      </div>
      <div className="lg:flex-2">
        <TradePanel symbol={selected} />
      </div>
    </div>
  );
}
