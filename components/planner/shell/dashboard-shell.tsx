"use client";

import { usePathname } from "next/navigation";
import { PlannerProvider } from "@/components/planner/data/planner-store";
import { Sidebar } from "@/components/planner/shell/sidebar";
import { Tabbar } from "@/components/planner/shell/tabbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  let page = pathname.replace(/^\/+|\/+$/g, "") || "beranda";
  if (page === "mahar-seserahan") page = "mahar";

  return (
    <PlannerProvider>
      <div id="app">
        <Sidebar />
        <main id="view" data-page={page}>
          {children}
        </main>
      </div>
      <Tabbar />
    </PlannerProvider>
  );
}
