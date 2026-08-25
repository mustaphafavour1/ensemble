import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div
            className="mx-auto w-full max-w-[1600px] px-8 pb-16"
            style={{ paddingTop: "var(--content-offset)" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
