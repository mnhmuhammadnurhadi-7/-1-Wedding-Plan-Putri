"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Task } from "@/components/planner/data/types";

interface PriorityChecklistProps {
  tasks: Task[];
  onToggleTask: (task: Task, done: boolean) => void;
  canWrite: boolean;
  notes?: Array<{ id: string; note?: string; topic?: string; pic?: string; due?: string; dueTime?: string }>;
}

function statusOf(t: Task): string {
  if (t.done) return "Selesai";
  return String(t.status || "Belum Dimulai");
}

export function PriorityChecklist({ tasks, onToggleTask, canWrite, notes = [] }: PriorityChecklistProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const rank = (t: Task) => [
    t.due && today && t.due < today ? 0 : 1,
    t.pri === "Tinggi" ? 0 : 1,
    t.due ?? "9999-99-99",
  ];
  const pending = tasks
    .filter((t) => !t.done)
    .sort((a, b) => {
      const x = rank(a), y = rank(b);
      for (let i = 0; i < 3; i++) {
        if (x[i] < y[i]) return -1;
        if (x[i] > y[i]) return 1;
      }
      return 0;
    })
    .slice(0, 5);

  const remNotes = notes
    .filter((n) => n.due)
    .sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"))
    .slice(0, 5);

  return (
    <div className="bn-two2">
      {/* Tugas Prioritas */}
      <section className="bn-card bn-tk">
        <div className="bn-in">
          <div className="bn-ch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <h2>
              <Link href="/checklist">Tugas Prioritas</Link>
            </h2>
            <span className="pill">{pending.length} tugas</span>
          </div>
          <div className="bn-rows">
            {pending.length === 0 ? (
              <div className="empty">
                Belum ada tugas yang menunggu.
                <br />
                <Link href="/checklist">Buka Checklist →</Link>
              </div>
            ) : (
              pending.map((t) => {
                const late = !!(t.due && t.due < today);
                const st = statusOf(t);
                return (
                  <div
                    key={t.id}
                    className="bn-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => canWrite && onToggleTask(t, !t.done)}
                  >
                    <span className="bn-lead" aria-hidden="true">
                      <i className="bn-ck" style={{ background: t.done ? 'var(--sage-s)' : '', borderColor: t.done ? 'var(--sage-s)' : '' }}></i>
                    </span>
                    <div className="bn-rm">
                      <div className="bn-rt">{String(t.task || t.title || "Tugas")}</div>
                      <div className="bn-rs">
                        <span>{[t.cat, t.pic].filter(Boolean).join(" · ") || "\u00a0"}</span>
                        {late && <span className="pill bad">Terlambat</span>}
                        {!late && t.pri === "Tinggi" && <span className="pill warn">Prioritas</span>}
                      </div>
                    </div>
                    <div className="bn-rr">
                      {t.due && (
                        <span className={`pill ${late ? "bad" : ""}`}>
                          {new Date(`${t.due}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      )}
                      <span className={`pill ${st === "Dalam Proses" ? "warn" : ""}`}>{st}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Tindak Lanjut */}
      <section className="bn-card bn-fu">
        <div className="bn-in">
          <div className="bn-ch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>
              <Link href="/catatan">Tindak Lanjut Terdekat</Link>
            </h2>
            <span className="pill">{remNotes.length} aktivitas</span>
          </div>
          <div className="bn-rows">
            {remNotes.length === 0 ? (
              <div className="empty">Tidak ada tindak lanjut yang terbuka.</div>
            ) : (
              remNotes.map((n) => {
                const late = !!(n.due && n.due < today);
                return (
                  <div key={n.id} className="bn-row" role="button" tabIndex={0}>
                    <span className="bn-lead" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <div className="bn-rm">
                      <div className="bn-rt">{String(n.note ?? "Catatan")}</div>
                      <div className="bn-rs">
                        <span>{[n.topic, n.pic].filter(Boolean).join(" · ") || "\u00a0"}</span>
                        {late && <span className="pill bad">Terlambat</span>}
                      </div>
                    </div>
                    <div className="bn-rr">
                      {n.due && (
                        <span className={`pill ${late ? "bad" : ""}`}>
                          {new Date(`${n.due}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
