"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/components/planner/data/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await login({ email, password });
      router.replace(response.session.role === "guest" ? "/undangan" : "/beranda");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error && reason.message === "invalid_credentials" ? "Email atau kata sandi tidak sesuai." : "Tidak dapat masuk. Periksa koneksi atau konfigurasi akun.");
    } finally { setLoading(false); }
  }
  return (
    <div style={{ maxWidth: 480, width: "100%", margin: "40px auto", padding: "32px 24px", background: "var(--surface)", borderRadius: 24, boxShadow: "var(--shadow)", border: "1px solid var(--line)" }}>
      <header style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-block", padding: "6px 14px", background: "var(--rose-bg)", borderRadius: 999, color: "var(--dusty)", fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>Wedding Planner Journal</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 32, color: "var(--dusty)", margin: "0 0 6px" }}>Antariksa &amp; Sofiya</h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>Masuk ke ruang perencanaan pernikahan</p>
      </header>
      <form onSubmit={submit}>
        {error && <div className="warnbox" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
        <label htmlFor="email" style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Email</label>
        <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--bg)", marginBottom: 16 }} />
        <label htmlFor="password" style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Kata sandi</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--bg)" }} />
        <button type="submit" className="btn pri" disabled={loading} style={{ width: "100%", justifyContent: "center", minHeight: 46, fontSize: 15, marginTop: 24 }}>{loading ? "Memverifikasi…" : "Masuk"}</button>
      </form>
    </div>
  );
}
