import Prices from "./ui/prices";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Paper Trading</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Simulation only. All prices and money are fake.
      </p>
      <div className="mt-6">
        <Prices />
      </div>
    </main>
  );
}
