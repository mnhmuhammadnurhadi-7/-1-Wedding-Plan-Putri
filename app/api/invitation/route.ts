import { connection, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getActiveSession } from "@/lib/auth";
import { parseJsonColumn, pool } from "@/lib/db";

export async function GET(request: Request) {
  await connection();
  if ((await getActiveSession(request))?.role !== "guest") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const [rows] = await pool.query<(RowDataPacket & { data: unknown })[]>("SELECT data FROM planner_documents WHERE id='settings' LIMIT 1");
    const data = rows[0] ? parseJsonColumn<Record<string, unknown>>(rows[0].data) : {};
    return NextResponse.json({ invitation: {
      groom: data.a || "",
      bride: data.b || "",
      date: data.weddingDate || "",
      time: data.weddingTime || "",
      akadDate: data.akadDate || "",
      akadTime: data.akadTime || "",
      akadPlace: data.akadPlace || "",
      resepsiDate: data.resepsiDate || "",
      resepsiTime: data.resepsiTime || "",
      resepsiPlace: data.resepsiPlace || "",
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/invitation", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}
