export default function TopBar() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <div className="text-xl font-bold">Paper Trading</div>
          <div className="text-xs text-gray-600">
            Simulation only. All prices and money are fake.
          </div>
        </div>
        <div className="text-sm text-gray-600">Demo account</div>
      </div>
    </div>
  );
}
