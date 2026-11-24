"use client";

import { useEffect, useState } from "react";

type User = { id: number; email: string; name: string; role: "superadmin" | "admin" | "guest"; active: boolean | number; created_at: string };
const emptyForm = { name: "", email: "", password: "", role: "admin" as User["role"] };

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentId, setCurrentId] = useState<number>();
  const [editingId, setEditingId] = useState<number>();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  async function load() {
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Gagal memuat akun");
    setUsers(result.users); setCurrentId(result.currentId);
  }
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/users", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Gagal memuat akun");
        if (!cancelled) { setUsers(result.users); setCurrentId(result.currentId); }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Gagal memuat akun");
      });
    return () => { cancelled = true; };
  }, []);
  function resetForm() { setEditingId(undefined); setForm(emptyForm); }
  function edit(user: User) { setError(""); setSaved(""); setEditingId(user.id); setForm({ name: user.name, email: user.email, password: "", role: user.role }); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaved("");
    const payload: Record<string, string | number> = { ...form };
    if (editingId) payload.id = editingId;
    if (editingId && !form.password) delete payload.password;
    const response = await fetch("/api/users", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error === "email_exists" ? "Email sudah terdaftar." : result.error === "last_superadmin" ? "Super Admin terakhir tidak dapat diubah." : result.error === "cannot_demote_self" ? "Akun Anda sendiri harus tetap menjadi Super Admin." : "Gagal menyimpan akun. Kata sandi baru minimal 12 karakter."); return; }
    setSaved(editingId ? "Perubahan akun tersimpan." : "Akun berhasil dibuat."); resetForm(); await load();
  }
  async function toggle(user: User) {
    setError("");
    const response = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, active: !(user.active === true || user.active === 1) }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error === "last_superadmin" ? "Super Admin terakhir tidak dapat dinonaktifkan." : "Gagal mengubah status akun."); return; }
    await load();
  }
  async function remove(user: User) {
    if (!window.confirm(`Hapus akun ${user.email} secara permanen?`)) return;
    setError("");
    const response = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error === "last_superadmin" ? "Super Admin terakhir tidak dapat dihapus." : "Gagal menghapus akun."); return; }
    if (editingId === user.id) resetForm();
    await load();
  }
  return <section className="card">
    <h3 style={{ marginBottom: 8, fontSize: 20 }}>Kelola Akun</h3>
    <p className="note">Buat, ubah, aktifkan, atau hapus akun Super Admin, Admin baca saja, dan Tamu undangan.</p>
    {error && <p role="alert" className="note" style={{ color: "var(--bad)" }}>{error}</p>}{saved && <p role="status" className="note">{saved}</p>}
    <form onSubmit={submit} className="grid g2" style={{ marginTop: 14 }}>
      <label>Nama<input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} style={{ display: "block", width: "100%", marginTop: 5 }} /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={254} style={{ display: "block", width: "100%", marginTop: 5 }} /></label>
      <label>Kata sandi{editingId ? " baru (opsional)" : " sementara"}<input name="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingId} minLength={12} autoComplete="new-password" style={{ display: "block", width: "100%", marginTop: 5 }} /></label>
      <label>Peran<select name="role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as User["role"] })} style={{ display: "block", width: "100%", marginTop: 5 }}><option value="superadmin">Super Admin</option><option value="admin">Admin (lihat saja)</option><option value="guest">Tamu (undangan)</option></select></label>
      <div style={{ display: "flex", gap: 8 }}><button className="btn pri" type="submit">{editingId ? "Simpan Perubahan" : "Buat Akun"}</button>{editingId && <button className="btn" type="button" onClick={resetForm}>Batal</button>}</div>
    </form>
    <div style={{ display: "grid", gap: 8, marginTop: 20 }}>{users.map((user) => <div key={user.id} className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><b>{user.name}{user.id === currentId ? " (Anda)" : ""}</b><div className="note">{user.email} · {user.role} · {user.active === true || user.active === 1 ? "Aktif" : "Nonaktif"}</div></div><div style={{ display: "flex", gap: 6 }}><button className="btn sm" type="button" onClick={() => edit(user)}>Ubah</button><button className="btn sm" type="button" onClick={() => void toggle(user)}>{user.active === true || user.active === 1 ? "Nonaktifkan" : "Aktifkan"}</button><button className="btn sm" type="button" disabled={user.id === currentId} onClick={() => void remove(user)}>Hapus</button></div></div>)}</div>
  </section>;
}
