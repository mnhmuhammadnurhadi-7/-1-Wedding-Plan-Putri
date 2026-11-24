import { DashboardShell } from "@/components/planner/shell/dashboard-shell";
import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookieName, verifySessionToken, type UserSession } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const token = (await cookies()).get(sessionCookieName)?.value || "";
  const tokenSession = verifySessionToken(token);
  let session: UserSession | null = null;
  if (tokenSession) {
    const [rows] = await pool.execute<(RowDataPacket & { role: "superadmin" | "admin" | "guest" })[]>("SELECT role FROM planner_users WHERE id=? AND active=TRUE", [tokenSession.id]);
    if (rows[0]) session = { ...tokenSession, role: rows[0].role };
  }
  if (!session) redirect("/login");
  if (session.role === "guest") redirect("/undangan");
  return <DashboardShell>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div aria-label="Memuat dashboard" style={{ minHeight: "50vh" }} />}><AuthenticatedDashboard>{children}</AuthenticatedDashboard></Suspense>;
}
