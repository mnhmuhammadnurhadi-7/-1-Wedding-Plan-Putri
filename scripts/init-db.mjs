import mysql from "mysql2/promise";
import { dbOptions } from "./db-options.mjs";

const database = process.env.DB_NAME || "wedding-plan";

const connection = await mysql.createConnection(dbOptions());

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS planner_documents (
      id VARCHAR(64) NOT NULL,
      data JSON NOT NULL,
      updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS planner_uploads (
      id CHAR(32) NOT NULL,
      name VARCHAR(255) NOT NULL,
      content_type VARCHAR(191) NOT NULL,
      size_bytes INT UNSIGNED NOT NULL,
      data LONGBLOB NOT NULL,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS planner_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(254) NOT NULL,
      name VARCHAR(120) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('superadmin','admin','guest') NOT NULL DEFAULT 'guest',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id), UNIQUE KEY uq_planner_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  const bootstrapEmail = (process.env.WP_SUPERADMIN_EMAIL || "merried@gmail.com").trim().toLowerCase();
  const bootstrapPassword = process.env.WP_SUPERADMIN_PASSWORD || "";
  if (bootstrapPassword.length >= 12) {
    const { randomBytes, scryptSync } = await import("node:crypto");
    const salt = randomBytes(16).toString("hex");
    const hash = `${salt}:${scryptSync(bootstrapPassword, salt, 64).toString("hex")}`;
    await connection.execute(
      "INSERT INTO planner_users (email,name,password_hash,role) VALUES (?,?,?,'superadmin') ON DUPLICATE KEY UPDATE email=email",
      [bootstrapEmail, "Mempelai", hash],
    );
  } else {
    console.log("Set WP_SUPERADMIN_PASSWORD (minimal 12 karakter) untuk membuat akun Super Admin awal.");
  }

  console.log(`Database ready: ${database}`);
} finally {
  await connection.end();
}
