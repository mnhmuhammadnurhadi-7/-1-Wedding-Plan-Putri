import { createHmac, timingSafeEqual } from "node:crypto";

export const editCookieName = "wp_edit";
export const sessionCookieName = "wp_session";

export type UserRole = "owner" | "editor" | "viewer";

export type UserSession = {
  name: string;
  role: UserRole;
  canWrite: boolean;
  issuedAt: number;
};

export function getPasscode() {
  return (process.env.WP_EDIT_PASSCODE || "").trim();
}

function secret() {
  return (
    process.env.WP_SESSION_SECRET ||
    getPasscode() ||
    "wp-local-development-session"
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function cookieValue(cookie: string | null, name: string) {
  if (!cookie) {
    return "";
  }

  for (const part of cookie.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) {
      continue;
    }
    if (part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return "";
      }
    }
  }

  return "";
}

export function editRequired() {
  return getPasscode().length > 0;
}

export function issueEditToken() {
  return createHmac("sha256", secret())
    .update(`wp-edit:${getPasscode()}`)
    .digest("base64url");
}

export function createSessionToken(session: UserSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): UserSession | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as UserSession;

    // Optional expiry (30 days)
    if (Date.now() - data.issuedAt > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): UserSession | null {
  const cookie = cookieValue(request.headers.get("cookie"), sessionCookieName);
  if (cookie) {
    const session = verifySessionToken(cookie);
    if (session) return session;
  }

  // Fallback: check legacy wp_edit cookie
  const editCookie = cookieValue(request.headers.get("cookie"), editCookieName);
  if (editCookie && safeEqual(editCookie, issueEditToken())) {
    return {
      name: "Antariksa & Sofiya",
      role: "owner",
      canWrite: true,
      issuedAt: Date.now(),
    };
  }

  // If no edit passcode is required, default to owner
  if (!editRequired()) {
    return {
      name: "Tamu / Pengguna Lokal",
      role: "owner",
      canWrite: true,
      issuedAt: Date.now(),
    };
  }

  return null;
}

export function isAuthorized(request: Request) {
  if (!editRequired()) {
    return true;
  }

  const supplied = request.headers.get("x-wp-passcode")?.trim() || "";
  if (supplied && safeEqual(supplied, getPasscode())) {
    return true;
  }

  const session = getSessionFromRequest(request);
  if (session && session.canWrite) {
    return true;
  }

  const cookie = cookieValue(request.headers.get("cookie"), editCookieName);
  return cookie.length > 0 && safeEqual(cookie, issueEditToken());
}
