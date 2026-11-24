import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const backupDir = path.resolve(process.cwd(), "db-backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const database = process.env.DB_NAME || "wedding-plan";
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database,
  charset: "utf8mb4",
});

const eventByCategory = {
  "Dokumen KUA": "Akad",
  Mahar: "Akad",
  Seserahan: "Akad",
  "Venue & Dekorasi": "Resepsi",
  Catering: "Resepsi",
  Undangan: "Resepsi",
  Tamu: "Resepsi",
  Souvenir: "Resepsi",
  Transportasi: "Resepsi",
  "Foto & Video": "Resepsi",
  "Acara / Hari-H": "Resepsi",
};

function parseData(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function normalizeDocument(id, raw) {
  const data = structuredClone(parseData(raw));
  if (id === "checklist") {
    for (const task of Object.values(data?.items || {})) {
      if (!task.status) task.status = task.done ? "Selesai" : "Belum Dimulai";
      if (!task.event) task.event = eventByCategory[task.cat || ""] || "Umum";
    }
  }
  if (id === "notes") {
    for (const note of Object.values(data?.items || {})) {
      if (note.type === "Keputusan") note.type = "Keputusan Keluarga";
      if (!note.type) {
        note.type = /^ide\b/i.test(String(note.note || ""))
          ? "Ide"
          : note.status === "Selesai"
            ? "Keputusan Keluarga"
            : "Perlu Dibahas";
      }
    }
  }
  if (id === "gifts") {
    for (const gift of Object.values(data?.items || {})) {
      if (!gift.status) gift.status = "Belum Dibeli";
    }
  }
  return data;
}

await fs.mkdir(backupDir, { recursive: true });

try {
  const [rows] = await connection.query("SELECT id, data FROM planner_documents ORDER BY id");
  const updates = rows
    .map((row) => ({ id: row.id, data: normalizeDocument(row.id, row.data) }))
    .filter((row, index) => JSON.stringify(row.data) !== JSON.stringify(parseData(rows[index].data)));
  let backupPath = null;
  if (updates.length) {
    backupPath = path.join(backupDir, `planner-documents-${stamp}.json`);
    await fs.writeFile(backupPath, JSON.stringify(rows.map((row) => ({ id: row.id, data: parseData(row.data) })), null, 2), { flag: "wx" });
  }

  await connection.beginTransaction();
  for (const row of updates) {
    await connection.execute(
      "UPDATE planner_documents SET data = CAST(? AS JSON) WHERE id = ?",
      [JSON.stringify(row.data), row.id],
    );
  }
  await connection.commit();
  const [verifiedRows] = await connection.query("SELECT id, data FROM planner_documents WHERE id IN ('checklist', 'notes', 'gifts')");
  const remainingEmpty = {};
  for (const row of verifiedRows) {
    const data = parseData(row.data);
    const items = Object.values(data?.items || {});
    const fields = row.id === "checklist" ? ["status", "event"] : row.id === "notes" ? ["type"] : ["status"];
    remainingEmpty[row.id] = Object.fromEntries(fields.map((field) => [
      field,
      items.filter((item) => item[field] == null || item[field] === "").length,
    ]));
  }
  console.log(JSON.stringify({ database, backupPath, updatedDocuments: updates.map((row) => row.id), remainingEmpty }, null, 2));
} catch (error) {
  try { await connection.rollback(); } catch {}
  throw error;
} finally {
  await connection.end();
}
