import { createHmac, timingSafeEqual } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export const sessionCookieName = "wp_session";
export type UserRole = "superadmin" | "admin" | "guest";
export type UserSession = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  issuedAt: number;
};

function secret() {
  const value = process.env.WP_SESSION_SECRET || "";
  if (value.length < 32) throw new Error("WP_SESSION_SECRET harus berisi minimal 32 karakter.");
  return value;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function cookieValue(cookie: string | null, name: string) {
  for (const part of (cookie || "").split(";")) {
    const index = part.indexOf("=");
    if (index >= 0 && part.slice(0, index).trim() === name) {
      try { return decodeURIComponent(part.slice(index + 1).trim()); } catch { return ""; }
    }
  }
  return "";
}

export function createSessionToken(session: UserSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): UserSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  let expected: string;
  try { expected = createHmac("sha256", secret()).update(payload).digest("base64url"); } catch { return null; }
  if (!safeEqual(signature, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UserSession;
    if (!session.id || !session.email || !["superadmin", "admin", "guest"].includes(session.role)) return null;
    if (!Number.isFinite(session.issuedAt) || Date.now() - session.issuedAt > 30 * 86400000) return null;
    return session;
  } catch { return null; }
}

export function getSessionFromRequest(request: Request) {
  return verifySessionToken(cookieValue(request.headers.get("cookie"), sessionCookieName));
}

export async function getActiveSession(request: Request) {
  const tokenSession = getSessionFromRequest(request);
  if (!tokenSession) return null;
  const [rows] = await pool.execute<(RowDataPacket & { id: number; email: string; name: string; role: UserRole })[]>(
    "SELECT id,email,name,role FROM planner_users WHERE id=? AND active=TRUE LIMIT 1",
    [tokenSession.id],
  );
  const user = rows[0];
  return user ? { ...tokenSession, id: user.id, email: user.email, name: user.name, role: user.role } : null;
}

export async function isAuthorized(request: Request) {
  return (await getActiveSession(request))?.role === "superadmin";
}

export async function canReadPlanner(request: Request) {
  const role = (await getActiveSession(request))?.role;
  return role === "superadmin" || role === "admin";
}
