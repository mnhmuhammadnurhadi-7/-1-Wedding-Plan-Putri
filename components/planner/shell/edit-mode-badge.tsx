"use client";

import { setPasscode } from "../data/api";
import { usePlanner } from "../data/planner-store";

export function EditModeBadge() {
  const { auth, canWrite } = usePlanner();
  if (!auth.required) return null;

  const style = {
    position: "fixed" as const,
    top: 10,
    right: 10,
    zIndex: 70,
    border: "1px solid #EDE1D8",
    background: "#fff",
    color: "#8C5362",
    borderRadius: 999,
    padding: "6px 14px",
    font: "600 12.5px Inter,system-ui,sans-serif",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(140,83,98,.12)",
  };

  return (
    <button
      id="wp-mode"
      type="button"
      style={style}
      onClick={() => {
        if (canWrite) {
          setPasscode("");
          window.location.reload();
          return;
        }
        const value = window.prompt("Masukkan kode edit:");
        if (value == null) return;
        setPasscode(value.trim());
        window.location.reload();
      }}
    >
      {canWrite ? "Mode edit · Keluar" : "Hanya lihat · Masuk mode edit"}
    </button>
  );
}
