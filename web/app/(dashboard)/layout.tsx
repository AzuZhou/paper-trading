import { AccountProvider } from "@/app/(dashboard)/providers/account-provider";
import { PricesProvider } from "@/app/(dashboard)/providers/prices-provider";
import Nav from "@/app/(dashboard)/ui/nav";
import Summary from "@/app/(dashboard)/ui/summary";
import TopBar from "@/app/(dashboard)/ui/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PricesProvider>
      <AccountProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-5xl px-6">
              <TopBar />
              <Summary />
              <Nav />
            </div>
          </div>
          <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
        </div>
      </AccountProvider>
    </PricesProvider>
  );
}
