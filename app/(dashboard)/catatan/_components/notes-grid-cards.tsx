"use client";

import { useEffect, useState } from "react";
import { noteType } from "@/components/planner/data/calculations";
import type { Note } from "@/components/planner/data/types";

interface NotesGridCardsProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onToggleNote: (note: Note) => void;
  onAddNote: () => void;
  canWrite: boolean;
}

export function NotesGridCards({
  notes,
  onEditNote,
  onToggleNote,
  onAddNote,
  canWrite,
}: NotesGridCardsProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const dueTag = (due?: string) => {
    if (!due) return null;
    const isLate = due < today;
    const isToday = due === today;
    const formatted = new Date(`${due}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    if (isLate) {
      return <span className="pill bad">Terlambat ({formatted})</span>;
    }
    if (isToday) {
      return <span className="pill warn">Hari ini ({formatted})</span>;
    }
    return <span>{formatted}</span>;
  };

  const priPill = (pri?: string) => {
    if (!pri || pri === "Sedang") return null;
    return <span className="pill warn">{pri}</span>;
  };

  if (!notes.length) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <b>Belum ada catatan</b>
        <p>Tulis ide, hasil diskusi, atau keputusan keluarga di sini.</p>
        {canWrite && (
          <button
            type="button"
            className="btn pri"
            style={{ marginTop: "12px" }}
            onClick={onAddNote}
          >
            + Tambah catatan
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid g2 top">
      {notes.map((n) => {
        const isDone = n.status === "Selesai";
        const nt = noteType(n);

        return (
          <article key={n.id} className={`card ${isDone ? "done" : ""}`}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <button
                type="button"
                className="cb"
                role="checkbox"
                aria-checked={isDone}
                aria-label="Tandai selesai"
                style={{ marginTop: "2px" }}
                onClick={() => canWrite && onToggleNote(n)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="16"
                  height="16"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>

              <div
                className="main click"
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() => canWrite && onEditNote(n)}
              >
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <span className="eyebrow">{n.topic || "Umum"}</span>
                  <span className="pill acc">{nt}</span>
                </div>
                <div className="t" style={{ fontWeight: 500, marginTop: "4px" }}>
                  {n.note}
                </div>
                {n.follow && (
                  <div className="note" style={{ marginTop: "4px" }}>
                    Tindak lanjut: {n.follow}
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }}>
                  {n.pic && <span className="note">{n.pic}</span>}
                  {priPill(n.pri)}
                  {!isDone && dueTag(n.due)}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
