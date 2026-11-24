"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/components/planner/data/api";
import { Icon } from "@/components/planner/ui/icon";

type RoleOption = {
  id: "owner" | "editor" | "viewer";
  title: string;
  desc: string;
  icon: string;
  badge: string;
};

const ROLES: RoleOption[] = [
  {
    id: "owner",
    title: "Mempelai (Antariksa & Sofiya)",
    desc: "Hak akses penuh untuk mengelola anggaran, tabungan, checklist, vendor, dan pengaturan.",
    icon: "heart",
    badge: "Pemilik Penuh",
  },
  {
    id: "editor",
    title: "Keluarga & Panitia Acara",
    desc: "Bisa mengisi dan memperbarui checklist tugas, daftar tamu, dokumen, serta catatan.",
    icon: "users",
    badge: "Pengedit",
  },
  {
    id: "viewer",
    title: "Tamu & Pengunjung",
    desc: "Melihat agenda acara akad, resepsi, countdown, dan ringkasan persiapan.",
    icon: "eye",
    badge: "Read Only",
  },
];

export function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"owner" | "editor" | "viewer">("owner");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login({
        role: selectedRole,
        passcode: passcode.trim() || undefined,
      });

      if (res.ok) {
        router.push("/beranda");
        router.refresh();
      } else {
        setError("Gagal masuk. Periksa kembali kode akses Anda.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      setError(message.includes("401") || message.includes("forbidden")
        ? "Kode akses (PIN) salah. Silakan coba lagi."
        : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "32px 24px",
        background: "var(--surface)",
        borderRadius: 24,
        boxShadow: "var(--shadow)",
        border: "1px solid var(--line)",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            background: "var(--rose-bg)",
            borderRadius: 999,
            color: "var(--dusty)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Wedding Planner Journal
        </div>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: 32,
            color: "var(--dusty)",
            margin: "0 0 6px",
          }}
        >
          Antariksa &amp; Sofiya
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>
          Silakan pilih peran Anda untuk membuka ruang rencana pernikahan
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="warnbox"
            style={{
              marginBottom: 16,
              background: "var(--bad-bg)",
              color: "var(--bad)",
              border: "1px solid var(--rose-ln)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 8,
              color: "var(--ink)",
            }}
          >
            Pilih Peran Masuk
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROLES.map((r) => {
              const active = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1.5px solid ${active ? "var(--dusty)" : "var(--line)"}`,
                    background: active ? "var(--rose-bg)" : "var(--bg)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: active ? "var(--dusty)" : "var(--surface)",
                      color: active ? "#fff" : "var(--dusty)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={r.icon} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <b style={{ fontSize: 14, color: "var(--ink)" }}>{r.title}</b>
                      <span
                        className={`pill ${active ? "acc" : ""}`}
                        style={{ fontSize: 10 }}
                      >
                        {r.badge}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedRole !== "viewer" && (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="passcode"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 6,
                color: "var(--ink)",
              }}
            >
              Kode Akses / PIN (Jika Diatur)
            </label>
            <input
              id="passcode"
              type="password"
              placeholder="Masukkan PIN keamanan"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--bg)",
              }}
            />
            <small className="note" style={{ display: "block", marginTop: 4 }}>
              Kosongkan jika sistem dijalankan tanpa kata sandi edit.
            </small>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
            className="btn pri"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", minHeight: 46, fontSize: 15 }}
          >
            {loading ? "Memverifikasi..." : `Masuk Sebagai ${selectedRole === "owner" ? "Mempelai" : selectedRole === "editor" ? "Panitia" : "Pengunjung"}`}
          </button>
        </div>
      </form>
    </div>
  );
}
