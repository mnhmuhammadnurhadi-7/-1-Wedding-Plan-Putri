import { connection } from "next/server";
import type { RowDataPacket } from "mysql2";
import { canReadPlanner } from "@/lib/auth";
import { pool } from "@/lib/db";

type UploadRow = RowDataPacket & {
  name: string;
  content_type: string;
  data: Buffer;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  await connection();

  if (!(await canReadPlanner(request))) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await context.params;
  if (!/^[a-f0-9]{32}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const [rows] = await pool.query<UploadRow[]>(
      "SELECT name, content_type, data FROM planner_uploads WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return new Response("Not found", { status: 404 });
    }

    const row = rows[0];
    const inline =
      /^image\/(jpeg|png|webp|gif|avif)$/.test(row.content_type) ||
      row.content_type === "application/pdf";
    const filename = encodeURIComponent(row.name).replace(/'/g, "%27");

    return new Response(new Uint8Array(row.data), {
      headers: {
        "Content-Type": inline
          ? row.content_type
          : "application/octet-stream",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
        "Content-Length": String(row.data.length),
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/uploads/[id]", error);
    return new Response("Server error", { status: 500 });
  }
}
