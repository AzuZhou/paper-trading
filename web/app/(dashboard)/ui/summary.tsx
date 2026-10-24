"use client";

import { useAccount } from "@/app/(dashboard)/providers/account-provider";
import { usePrices } from "@/app/(dashboard)/providers/prices-provider";
import {
  createAccount,
  holdingsValueCents,
  STARTING_CASH_CENTS,
} from "@/lib/account";
import { formatGain, formatUsd } from "@/lib/format";

export default function Summary() {
  const { account: saved } = useAccount();
  const prices = usePrices();

  // Until the saved account loads, show a brand-new one.
  const account = saved ?? createAccount();

  // null when we hold shares but don't have their live prices yet.
  const holdingsCents = holdingsValueCents(account, prices?.prices ?? {});
  const valueCents =
    holdingsCents === null ? null : account.cashCents + holdingsCents;
  const gainCents =
    valueCents === null ? null : valueCents - STARTING_CASH_CENTS;

  const gainColor =
    gainCents === null || gainCents === 0
      ? "text-gray-900"
      : gainCents > 0
        ? "text-emerald-700"
        : "text-red-700";

  return (
    <section
      aria-label="Account summary"
      className="flex flex-wrap items-end gap-x-12 gap-y-4 pb-4 pt-5"
    >
      <div>
        <div className="text-sm text-gray-600">Portfolio value</div>
        <div className="text-4xl font-bold tabular-nums">
          {valueCents === null ? "—" : formatUsd(valueCents)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Cash</div>
        <div className="text-2xl font-semibold tabular-nums">
          {formatUsd(account.cashCents)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Total gain</div>
        <div className={`text-2xl font-semibold tabular-nums ${gainColor}`}>
          {gainCents === null ? "—" : formatGain(gainCents)}
        </div>
      </div>
    </section>
  );
}
