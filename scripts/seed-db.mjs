import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { dbOptions } from "./db-options.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const exportPath =
  process.argv[2] ||
  [
    path.resolve(here, "../../wedding-planner-export-2026-11-22.json"),
    path.resolve(here, "../wedding-planner-export-2026-11-22.json"),
    path.resolve(process.cwd(), "wedding-planner-export-2026-11-22.json"),
    path.resolve(process.cwd(), "../wedding-planner-export-2026-11-22.json"),
  ].find((p) => fs.existsSync(p));
const database = process.env.DB_NAME || "wedding-plan";

if (!fs.existsSync(exportPath)) {
  console.error(`Export file not found: ${exportPath}`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(exportPath, "utf8"));
if (!payload || payload.format !== "wp-export" || !payload.data) {
  console.error("Not a valid wedding planner export.");
  process.exit(1);
}

const connection = await mysql.createConnection(dbOptions());

try {
  await connection.beginTransaction();

  for (const [id, value] of Object.entries(payload.data)) {
    const data =
      id === "settings"
        ? value || {}
        : { items: (value && value.items) || {} };

    await connection.execute(
      "INSERT INTO planner_documents (id, data) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [id, JSON.stringify(data)],
    );

    const count =
      id === "settings"
        ? Object.keys(data).length
        : Object.keys(data.items).length;
    console.log(`${id}: ${count}`);
  }

  await connection.commit();
  console.log(`Seeded ${database} from ${exportPath}`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
