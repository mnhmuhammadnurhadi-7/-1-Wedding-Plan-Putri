import type { DocRow } from "./types";

const PASS_KEY = "wp-edit-passcode";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.code = status === 401 || status === 403 ? "forbidden" : `http_${status}`;
  }
}

export function getPasscode() {
  try {
    return localStorage.getItem(PASS_KEY) || "";
  } catch {
    return "";
  }
}

export function setPasscode(value: string) {
  try {
    localStorage.setItem(PASS_KEY, value);
  } catch {
    /* storage unavailable */
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };
  const passcode = getPasscode();
  if (passcode) headers["x-wp-passcode"] = passcode;

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(path, {
    method: options.method || "GET",
    headers,
    body: body as BodyInit | undefined,
    cache: "no-store",
  });
  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  if (!response.ok) {
    const message =
      (json as { error?: string; message?: string } | null)?.error ||
      (json as { error?: string; message?: string } | null)?.message ||
      text ||
      `HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }
  return json as T;
}

export async function readAll() {
  const json = await request<{ docs?: Record<string, DocRow> }>("/api/docs");
  return json?.docs || {};
}

export async function writeDocument(id: string, data: unknown) {
  return request(`/api/docs/${encodeURIComponent(id)}`, {
    method: "POST",
    body: { data },
  });
}

export async function mergeDocument(id: string, patch: unknown) {
  return request(`/api/docs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { patch },
  });
}

export async function checkAuth() {
  try {
    return await request<{
      required: boolean;
      ok: boolean;
      session?: { name: string; role: string; canWrite: boolean };
    }>("/api/auth");
  } catch (error) {
    if (error instanceof ApiError && error.code === "forbidden") {
      return { required: true, ok: false };
    }
    throw error;
  }
}

export type LoginPayload = {
  role: "owner" | "editor" | "viewer";
  name?: string;
  passcode?: string;
};

export async function login(payload: LoginPayload) {
  if (payload.passcode) {
    setPasscode(payload.passcode);
  }
  return request<{
    ok: boolean;
    session: { name: string; role: string; canWrite: boolean };
  }>("/api/auth", {
    method: "POST",
    body: payload,
  });
}

export async function logout() {
  setPasscode("");
  return request<{ ok: boolean }>("/api/auth", {
    method: "DELETE",
  });
}

export async function uploadBlob(blob: Blob, name?: string) {
  const type = blob.type || "application/octet-stream";
  const ext =
    (type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8) ||
    "bin";
  const filename =
    name || `upload-${Date.now().toString(36)}.${ext}`;
  const form = new FormData();
  form.append("file", blob, filename);
  return request<{ id: string; url: string }>("/api/uploads", {
    method: "POST",
    body: form,
  });
}

export async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      1400 / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        0.82,
      );
    });
  } catch {
    return file;
  }
}

export async function saveExport(
  data: Record<string, unknown>,
  counts: Record<string, number>,
) {
  const payload = {
    app: "Wedding Planner Antariksa & Sofiya",
    format: "wp-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    collection: "wp",
    note: "settings = satu dokumen datar; koleksi lain = {items:{id:data}}",
    counts,
    data,
  };
  const json = JSON.stringify(payload, null, 2);
  const name = `wedding-planner-export-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
