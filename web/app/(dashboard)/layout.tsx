import Summary from "@/app/(dashboard)/ui/summary";
import TopBar from "@/app/(dashboard)/ui/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <Summary />
      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </>
  );
}
