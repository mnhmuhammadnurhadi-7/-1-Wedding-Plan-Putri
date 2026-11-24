import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  wpPool?: mysql.Pool;
};

function numberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createPool() {
  const ssl =
    process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined;

  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: numberEnv("DB_PORT", 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedding-plan",
    connectionLimit: numberEnv("DB_POOL_SIZE", 5),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    charset: "utf8mb4",
    timezone: "Z",
    connectTimeout: 10000,
    ssl,
  });
}

export const pool = globalForDb.wpPool || createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.wpPool = pool;
}

export function parseJsonColumn<T>(value: unknown): T {
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }
  return value as T;
}

export function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}
