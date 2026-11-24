import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { connection, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getActiveSession } from "@/lib/auth";
import { pool } from "@/lib/db";

const scrypt = promisify(scryptCallback);
const roles = ["superadmin", "admin", "guest"] as const;
type UserRole = (typeof roles)[number];
type UserRow = RowDataPacket & { id: number; email: string; name: string; role: UserRole; active: number; created_at: Date };

export async function GET(request: Request) {
  await connection();
  if ((await getActiveSession(request))?.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const [users] = await pool.query<UserRow[]>("SELECT id,email,name,role,active,created_at FROM planner_users ORDER BY created_at");
    const session = await getActiveSession(request);
    return NextResponse.json({ users, currentId: session?.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/users", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connection();
  if ((await getActiveSession(request))?.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: { email?: string; name?: string; password?: string; role?: UserRole };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const email = (body.email || "").trim().toLowerCase();
  const name = (body.name || "").trim();
  const password = body.password || "";
  const role = body.role;
  if (!email.includes("@") || email.length > 254 || !name || name.length > 120 || password.length < 12 || !role || !roles.includes(role)) {
    return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  }
  try {
    const salt = randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64) as Buffer;
    await pool.execute("INSERT INTO planner_users (email,name,password_hash,role) VALUES (?,?,?,?)", [email, name, `${salt}:${hash.toString("hex")}`, role]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return NextResponse.json({ error: "email_exists" }, { status: 409 });
    console.error("POST /api/users", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  await connection();
  const session = await getActiveSession(request);
  if (session?.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: { id?: number; active?: boolean };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (typeof body.id !== "number" || !Number.isSafeInteger(body.id) || typeof body.active !== "boolean" || (body.id === session.id && !body.active)) return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  const id = body.id;
  try {
    if (!body.active) {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM planner_users WHERE role='superadmin' AND active=TRUE");
      const [target] = await pool.execute<UserRow[]>("SELECT role,active FROM planner_users WHERE id=?", [id]);
      if (target[0]?.role === "superadmin" && target[0].active && Number(rows[0].total) <= 1) return NextResponse.json({ error: "last_superadmin" }, { status: 409 });
    }
    await pool.execute("UPDATE planner_users SET active=? WHERE id=?", [body.active, id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/users", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await connection();
  const session = await getActiveSession(request);
  if (session?.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: { id?: number; email?: string; name?: string; password?: string; role?: UserRole };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const email = (body.email || "").trim().toLowerCase();
  const name = (body.name || "").trim();
  const password = body.password || "";
  const role = body.role;
  if (typeof body.id !== "number" || !Number.isSafeInteger(body.id) || !email.includes("@") || email.length > 254 || !name || name.length > 120 || (password && password.length < 12) || !role || !roles.includes(role)) {
    return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  }
  const id = body.id;
  if (id === session.id && role !== "superadmin") return NextResponse.json({ error: "cannot_demote_self" }, { status: 409 });
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const [found] = await db.execute<UserRow[]>("SELECT id,role,active FROM planner_users WHERE id=? FOR UPDATE", [id]);
    if (!found[0]) { await db.rollback(); return NextResponse.json({ error: "user_not_found" }, { status: 404 }); }
    if (found[0].role === "superadmin" && found[0].active && role !== "superadmin") {
      const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM planner_users WHERE role='superadmin' AND active=TRUE");
      if (Number(rows[0].total) <= 1) { await db.rollback(); return NextResponse.json({ error: "last_superadmin" }, { status: 409 }); }
    }
    if (password) {
      const salt = randomBytes(16).toString("hex");
      const hash = await scrypt(password, salt, 64) as Buffer;
      await db.execute("UPDATE planner_users SET email=?,name=?,role=?,password_hash=? WHERE id=?", [email, name, role, `${salt}:${hash.toString("hex")}`, id]);
    } else {
      await db.execute("UPDATE planner_users SET email=?,name=?,role=? WHERE id=?", [email, name, role, id]);
    }
    await db.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await db.rollback();
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return NextResponse.json({ error: "email_exists" }, { status: 409 });
    console.error("PUT /api/users", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  } finally { db.release(); }
}

export async function DELETE(request: Request) {
  await connection();
  const session = await getActiveSession(request);
  if (session?.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: { id?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id === session.id) return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  const id = body.id;
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const [found] = await db.execute<UserRow[]>("SELECT id,role,active FROM planner_users WHERE id=? FOR UPDATE", [id]);
    if (!found[0]) { await db.rollback(); return NextResponse.json({ error: "user_not_found" }, { status: 404 }); }
    if (found[0].role === "superadmin" && found[0].active) {
      const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM planner_users WHERE role='superadmin' AND active=TRUE");
      if (Number(rows[0].total) <= 1) { await db.rollback(); return NextResponse.json({ error: "last_superadmin" }, { status: 409 }); }
    }
    await db.execute("DELETE FROM planner_users WHERE id=?", [id]);
    await db.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await db.rollback();
    console.error("DELETE /api/users", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  } finally { db.release(); }
}
