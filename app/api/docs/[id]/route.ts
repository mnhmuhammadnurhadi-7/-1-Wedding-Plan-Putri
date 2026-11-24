import { connection, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { isAuthorized } from "@/lib/auth";
import { isoDate, parseJsonColumn, pool } from "@/lib/db";
import {
  isDocId,
  isRecord,
  type StoredDocument,
} from "@/lib/planner";

type DocumentRow = RowDataPacket & {
  data: unknown;
  updated_at: Date | string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function forbidden() {
  return NextResponse.json(
    { error: "forbidden" },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

function badRequest() {
  return NextResponse.json(
    { error: "invalid_document" },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}

async function readDocument(id: string): Promise<StoredDocument | null> {
  const [rows] = await pool.query<DocumentRow[]>(
    "SELECT data, updated_at FROM planner_documents WHERE id = ?",
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    data: parseJsonColumn(rows[0].data),
    updated_at: isoDate(rows[0].updated_at),
  };
}

export async function POST(request: Request, context: RouteContext) {
  await connection();
  const { id } = await context.params;

  if (!isDocId(id)) {
    return badRequest();
  }
  if (!isAuthorized(request)) {
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  if (!isRecord(body) || !isRecord(body.data)) {
    return badRequest();
  }

  try {
    await pool.execute(
      "INSERT INTO planner_documents (id, data) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [id, JSON.stringify(body.data)],
    );

    const document = await readDocument(id);
    return NextResponse.json(document, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("POST /api/docs/[id]", id, error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  await connection();
  const { id } = await context.params;

  if (!isDocId(id)) {
    return badRequest();
  }
  if (!isAuthorized(request)) {
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  if (!isRecord(body) || !isRecord(body.patch)) {
    return badRequest();
  }

  const patch = body.patch;
  if ("items" in patch && !isRecord(patch.items)) {
    return badRequest();
  }

  const db = await pool.getConnection();

  try {
    await db.beginTransaction();

    const [rows] = await db.query<DocumentRow[]>(
      "SELECT data FROM planner_documents WHERE id = ? FOR UPDATE",
      [id],
    );

    const current = rows.length > 0 ? parseJsonColumn(rows[0].data) : null;
    const base = isRecord(current) ? current : {};
    const fallback = id === "settings" ? {} : { items: {} };
    const merged: Record<string, unknown> = {
      ...fallback,
      ...base,
      ...patch,
    };

    if (isRecord(patch.items) && isRecord(base.items)) {
      merged.items = {
        ...base.items,
        ...patch.items,
      };
    }

    await db.execute(
      "INSERT INTO planner_documents (id, data) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [id, JSON.stringify(merged)],
    );

    await db.commit();
  } catch (error) {
    await db.rollback();
    console.error("PATCH /api/docs/[id]", id, error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 500 },
    );
  } finally {
    db.release();
  }

  const document = await readDocument(id);
  return NextResponse.json(document, {
    headers: { "Cache-Control": "no-store" },
  });
}
