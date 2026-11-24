"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/components/planner/data/planner-store";

export default function PengaturanPage() {
  const router = useRouter();
  const { data, canWrite, putSettings, auth } = usePlanner();

  const settings = data.settings || {};
  const [groom, setGroom] = useState(settings.a || "Antariksa");
  const [bride, setBride] = useState(settings.b || "Sofiya");
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate || "2026-08-08");
  const [target, setTarget] = useState(String(settings.target || 150000000));
  const [guestTarget, setGuestTarget] = useState(String(settings.guestTarget || 100));
  const [tabA, setTabA] = useState(settings.tabA || "Tabungan Antariksa (Izza)");
  const [tabB, setTabB] = useState(settings.tabB || "Tabungan Putri Sofiyani (Sofiya)");
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    putSettings({
      a: groom,
      b: bride,
      weddingDate,
      target: Number(target) || 0,
      guestTarget: Number(guestTarget) || 0,
      tabA,
      tabB,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-plan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Pengaturan Sistem</h1>
          <p>Kelola identitas kedua mempelai, target dana pernikahan, dan sesi login</p>
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        {/* Profil & Target Pernikahan */}
        <section className="card">
          <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>
            Profil &amp; Jadwal Pernikahan
          </h3>
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Nama Mempelai Pria
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Nama Mempelai Wanita
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Tanggal Akad / Resepsi
              </label>
              <input
                type="date"
                disabled={!canWrite}
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Target Total Anggaran (Rp)
              </label>
              <input
                type="number"
                disabled={!canWrite}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Target Jumlah Tamu (Undangan)
              </label>
              <input
                type="number"
                disabled={!canWrite}
                value={guestTarget}
                onChange={(e) => setGuestTarget(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Label Rekening Tabungan Pria
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={tabA}
                onChange={(e) => setTabA(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--muted)", marginBottom: "4px" }}>
                Label Rekening Tabungan Wanita
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={tabB}
                onChange={(e) => setTabB(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--surface)" }}
              />
            </div>

            {canWrite && (
              <button type="submit" className="btn pri" style={{ width: "100%" }}>
                {saved ? "Tersimpan!" : "Simpan Perubahan"}
              </button>
            )}
          </form>
        </section>

        {/* Sesi & Cadangan Data */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <section className="card">
            <h3 style={{ marginBottom: "8px", fontSize: "20px" }}>Sesi &amp; Hak Akses Akun</h3>
            <p className="note" style={{ marginBottom: "16px" }}>
              Status Anda saat ini:{" "}
              <span className="pill acc" style={{ textTransform: "uppercase", fontWeight: 700 }}>
                {auth.session?.role || "Owner"}
              </span>
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="btn"
              style={{ color: "var(--bad)" }}
            >
              Ganti Akun / Logout
            </button>
          </section>

          <section className="card">
            <h3 style={{ marginBottom: "8px", fontSize: "20px" }}>Cadangan Data (Backup)</h3>
            <p className="note" style={{ marginBottom: "16px" }}>
              Unduh seluruh data perencanaan pernikahan dalam format file JSON.
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="btn"
            >
              Ekspor Backup JSON
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
