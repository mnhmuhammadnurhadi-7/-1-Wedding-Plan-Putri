import mysql from "mysql2/promise";

const database = process.env.DB_NAME || "wedding-plan";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database,
  charset: "utf8mb4",
});

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

  console.log(`Database ready: ${database}`);
} finally {
  await connection.end();
}
