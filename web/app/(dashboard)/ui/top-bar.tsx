export default function TopBar() {
  return (
    <header className="flex items-center justify-between pt-4">
      <div>
        <div className="text-xl font-bold">Paper Trading</div>
        <div className="text-xs text-gray-600">
          Simulation only. All prices and money are fake.
        </div>
      </div>
      <div className="text-sm text-gray-600">Demo account</div>
    </header>
  );
}
