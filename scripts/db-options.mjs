export function dbOptions() {
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, "\n");
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedding-plan",
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true"
      ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) }
      : undefined,
  };
}
