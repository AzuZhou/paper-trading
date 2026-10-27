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
      className="flex flex-wrap items-end gap-x-6 gap-y-2 pb-4 pt-4 lg:gap-x-12 lg:pt-5"
    >
      <div className="w-full lg:w-auto">
        <div className="text-xs text-gray-600 lg:text-sm">Portfolio value</div>
        <div className="text-3xl font-bold tabular-nums lg:text-4xl">
          {valueCents === null ? "—" : formatUsd(valueCents)}
        </div>
      </div>
      <div className="flex w-full gap-6 lg:w-auto lg:gap-12">
        <div>
          <div className="text-xs text-gray-600 lg:text-sm">Cash</div>
          <div className="text-base font-semibold tabular-nums lg:text-2xl">
            {formatUsd(account.cashCents)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 lg:text-sm">Total gain</div>
          <div
            className={`text-base font-semibold tabular-nums lg:text-2xl ${gainColor}`}
          >
            {gainCents === null ? "—" : formatGain(gainCents)}
          </div>
        </div>
      </div>
    </section>
  );
}
