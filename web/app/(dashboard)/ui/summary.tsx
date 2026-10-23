import { createAccount, STARTING_CASH_CENTS } from "@/lib/account";
import { formatGain, formatUsd } from "@/lib/format";

export default function Summary() {
  // Placeholder until lib/api.ts exists: a brand-new account, nothing stored yet.
  const account = createAccount();
  const valueCents = account.cashCents; // no holdings yet
  const gainCents = valueCents - STARTING_CASH_CENTS;

  const gainColor =
    gainCents > 0
      ? "text-emerald-700"
      : gainCents < 0
        ? "text-red-700"
        : "text-gray-900";

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-x-12 gap-y-4 px-6 py-6">
        <div>
          <div className="text-sm text-gray-600">Portfolio value</div>
          <div className="text-4xl font-bold tabular-nums">
            {formatUsd(valueCents)}
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
            {formatGain(gainCents)}
          </div>
        </div>
      </div>
    </section>
  );
}
