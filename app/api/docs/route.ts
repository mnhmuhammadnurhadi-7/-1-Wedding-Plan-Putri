import { connection, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { isoDate, parseJsonColumn, pool } from "@/lib/db";
import { canReadPlanner } from "@/lib/auth";
import type { StoredDocument } from "@/lib/planner";

type DocumentRow = RowDataPacket & {
  id: string;
  data: unknown;
  updated_at: Date | string;
};

export async function GET(request: Request) {
  await connection();
  if (!(await canReadPlanner(request))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const [rows] = await pool.query<DocumentRow[]>(
      "SELECT id, data, updated_at FROM planner_documents",
    );

    const docs: Record<string, StoredDocument> = {};
    for (const row of rows) {
      docs[row.id] = {
        data: parseJsonColumn(row.data),
        updated_at: isoDate(row.updated_at),
      };
    }

    return NextResponse.json(
      { docs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GET /api/docs", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 500 },
    );
  }
}
