import { connection, NextResponse } from "next/server";
import {
  createSessionToken,
  editCookieName,
  editRequired,
  getPasscode,
  getSessionFromRequest,
  isAuthorized,
  issueEditToken,
  sessionCookieName,
  type UserRole,
  type UserSession,
} from "@/lib/auth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function GET(request: Request) {
  await connection();
  const required = editRequired();
  const ok = isAuthorized(request);
  const session = getSessionFromRequest(request);

  return NextResponse.json(
    {
      required,
      ok,
      session: session || {
        name: "Pengunjung",
        role: "viewer" as UserRole,
        canWrite: !required,
        issuedAt: Date.now(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  await connection();

  let body: { role?: UserRole; name?: string; passcode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const role: UserRole = body.role || "viewer";
  const name = (body.name || (role === "owner" ? "Antariksa & Sofiya" : "Keluarga / Panitia")).trim();
  const inputPasscode = (body.passcode || "").trim();

  const required = editRequired();

  // If role requires write access (owner or editor) and passcode is set in env
  if (required && role !== "viewer") {
    if (inputPasscode !== getPasscode()) {
      return NextResponse.json(
        { error: "invalid_passcode", message: "Kode akses (PIN) salah." },
        { status: 401 },
      );
    }
  }

  const session: UserSession = {
    name,
    role,
    canWrite: role !== "viewer" || !required,
    issuedAt: Date.now(),
  };

  const response = NextResponse.json({
    ok: true,
    session,
  });

  const sessionToken = createSessionToken(session);
  response.cookies.set(sessionCookieName, sessionToken, cookieOptions);

  if (session.canWrite) {
    response.cookies.set(editCookieName, issueEditToken(), cookieOptions);
  }

  return response;
}

export async function DELETE() {
  await connection();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(editCookieName, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
