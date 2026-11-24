import { promisify } from "node:util";
import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { connection, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { createSessionToken, getActiveSession, sessionCookieName, type UserRole, type UserSession } from "@/lib/auth";
import { pool } from "@/lib/db";

const scrypt = promisify(scryptCallback);
type UserRow = RowDataPacket & { id: number; email: string; name: string; password_hash: string; role: UserRole; active: number };
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

export async function GET(request: Request) {
  await connection();
  let session: UserSession | null = null;
  try { session = await getActiveSession(request); } catch { /* no active session while database is unavailable */ }
  return NextResponse.json({ ok: !!session, session }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  await connection();
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password || email.length > 254) return NextResponse.json({ error: "credentials_required" }, { status: 400 });
  try {
    const [rows] = await pool.execute<UserRow[]>("SELECT id,email,name,password_hash,role,active FROM planner_users WHERE email=? LIMIT 1", [email]);
    const user = rows[0];
    let valid = false;
    if (user?.active) {
      const [salt, stored] = user.password_hash.split(":");
      const derived = await scrypt(password, salt, 64) as Buffer;
      const expected = Buffer.from(stored || "", "hex");
      valid = derived.length === expected.length && timingSafeEqual(derived, expected);
    }
    if (!valid || !user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    const session: UserSession = { id: user.id, email: user.email, name: user.name, role: user.role, issuedAt: Date.now() };
    const response = NextResponse.json({ ok: true, session });
    response.cookies.set(sessionCookieName, createSessionToken(session), cookieOptions);
    return response;
  } catch (error) {
    console.error("POST /api/auth", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function DELETE() {
  await connection();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
