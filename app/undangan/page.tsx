import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { RowDataPacket } from "mysql2";
import { sessionCookieName, verifySessionToken } from "@/lib/auth";
import { parseJsonColumn, pool } from "@/lib/db";
import { LogoutButton } from "@/components/modules/auth/logout-button";

type Invitation = { a?: string; b?: string; weddingDate?: string; akadDate?: string; akadTime?: string; akadPlace?: string; resepsiDate?: string; resepsiTime?: string; resepsiPlace?: string };
function dateLabel(value?: string) {
  if (!value) return "Waktu akan diumumkan";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

async function InvitationContent() {
  await connection();
  const token = (await cookies()).get(sessionCookieName)?.value || "";
  const session = verifySessionToken(token);
  if (!session) redirect("/login");
  const [accountRows] = await pool.execute<(RowDataPacket & { role: string; name: string })[]>("SELECT role,name FROM planner_users WHERE id=? AND active=TRUE", [session.id]);
  if (!accountRows[0]) redirect("/login");
  if (accountRows[0].role !== "guest") redirect("/beranda");
  let data: Invitation = {};
  try {
    const [rows] = await pool.query<(RowDataPacket & { data: unknown })[]>("SELECT data FROM planner_documents WHERE id='settings' LIMIT 1");
    if (rows[0]) data = parseJsonColumn<Invitation>(rows[0].data);
  } catch {
    data = {};
  }
  return <main style={{ minHeight: "100vh", padding: "40px 18px", display: "grid", placeItems: "center", background: "linear-gradient(145deg, #f7eee9, #fffaf6 55%, #efe5df)" }}>
    <article style={{ width: "min(680px, 100%)", padding: "clamp(28px, 7vw, 64px)", textAlign: "center", background: "rgba(255,255,255,.88)", border: "1px solid #e8d8d0", borderRadius: 28, boxShadow: "0 24px 70px rgba(100,65,65,.12)", color: "#55464a" }}>
      <p style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12, color: "#a36e78" }}>Undangan Pernikahan</p>
      <p style={{ marginTop: 38 }}>Kepada {accountRows[0].name},</p>
      <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(38px, 8vw, 64px)", lineHeight: 1.1, fontWeight: 500, color: "#91646d", margin: "16px 0" }}>{data.a || "Mempelai"}<br /><span style={{ fontSize: ".55em" }}>&amp;</span><br />{data.b || "Pasangan"}</h1>
      <p style={{ maxWidth: 480, margin: "20px auto 34px", lineHeight: 1.8 }}>Dengan penuh sukacita, kami mengundang Anda untuk hadir dan memberikan doa restu pada hari istimewa kami.</p>
      <p style={{ fontSize: 18, color: "#91646d" }}>{dateLabel(data.weddingDate)}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 30, textAlign: "left" }}>
        <section style={{ padding: 20, borderRadius: 16, background: "#fbf5f2" }}><b>Akad Nikah</b><p style={{ marginBottom: 4 }}>{dateLabel(data.akadDate || data.weddingDate)}</p><p style={{ margin: 0 }}>{data.akadTime || ""}{data.akadPlace ? ` · ${data.akadPlace}` : ""}</p></section>
        <section style={{ padding: 20, borderRadius: 16, background: "#fbf5f2" }}><b>Resepsi</b><p style={{ marginBottom: 4 }}>{dateLabel(data.resepsiDate || data.weddingDate)}</p><p style={{ margin: 0 }}>{data.resepsiTime || ""}{data.resepsiPlace ? ` · ${data.resepsiPlace}` : ""}</p></section>
      </div>
      <p style={{ marginTop: 38, color: "#a36e78" }}>Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda.</p>
      <LogoutButton />
    </article>
  </main>;
}

export default function InvitationPage() {
  return <Suspense fallback={<main aria-label="Memuat undangan" style={{ minHeight: "100vh" }} />}><InvitationContent /></Suspense>;
}
