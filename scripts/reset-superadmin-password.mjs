import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import mysql from "mysql2/promise";
import { dbOptions } from "./db-options.mjs";

const password = process.env.WP_SUPERADMIN_RESET_PASSWORD || "";
if (password.length < 12) {
  throw new Error("WP_SUPERADMIN_RESET_PASSWORD wajib berisi minimal 12 karakter.");
}

const options = dbOptions();
if (!["127.0.0.1", "localhost", "::1"].includes(options.host)) {
  throw new Error("Reset ditolak: DB_HOST bukan localhost. Perintah ini hanya untuk database lokal.");
}

const email = (process.env.WP_SUPERADMIN_EMAIL || "merried@gmail.com").trim().toLowerCase();
const salt = randomBytes(16).toString("hex");
const scrypt = promisify(scryptCallback);
const hash = await scrypt(password, salt, 64);
const connection = await mysql.createConnection(options);

try {
  const [result] = await connection.execute(
    "UPDATE planner_users SET password_hash=? WHERE email=? AND role='superadmin'",
    [`${salt}:${hash.toString("hex")}`, email],
  );
  if (result.affectedRows !== 1) {
    throw new Error("Akun Super Admin tidak ditemukan. Pastikan DB_NAME dan WP_SUPERADMIN_EMAIL benar.");
  }
  console.log("Password Super Admin lokal berhasil diperbarui. Silakan login kembali.");
} finally {
  await connection.end();
}
