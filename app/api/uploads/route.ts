import { randomUUID } from "node:crypto";
import { connection, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { pool } from "@/lib/db";

const maxUploadBytes = 12 * 1024 * 1024;

export async function POST(request: Request) {
  await connection();

  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "forbidden" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { error: "file_too_large", maxBytes: maxUploadBytes },
      { status: 413 },
    );
  }

  const id = randomUUID().replace(/-/g, "");
  const contentType = file.type || "application/octet-stream";
  const data = Buffer.from(await file.arrayBuffer());

  try {
    await pool.execute(
      "INSERT INTO planner_uploads (id, name, content_type, size_bytes, data) VALUES (?, ?, ?, ?, ?)",
      [id, file.name.slice(0, 255), contentType.slice(0, 191), file.size, data],
    );

    return NextResponse.json({
      id,
      url: `/api/uploads/${id}`,
      sizeBytes: file.size,
      contentType,
    });
  } catch (error) {
    console.error("POST /api/uploads", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 500 },
    );
  }
}
