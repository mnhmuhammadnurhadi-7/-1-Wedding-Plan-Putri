"use client";
import { useRouter } from "next/navigation";
export function LogoutButton() {
  const router = useRouter();
  return <button type="button" onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); router.replace("/login"); router.refresh(); }} style={{ color: "#9a7379", fontSize: 13, border: 0, background: "none", cursor: "pointer" }}>Keluar</button>;
}
