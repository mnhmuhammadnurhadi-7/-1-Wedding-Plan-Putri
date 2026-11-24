"use client";

import Link from "next/link";
import { usePlanner } from "@/components/planner/data/planner-store";
import { nameA, nameB } from "@/components/planner/data/calculations";
import { BNFL } from "@/components/planner/data/assets";
import type { Task } from "@/components/planner/data/types";
import { CountdownBanner } from "./_components/countdown-banner";
import { ExecutiveStats } from "./_components/executive-stats";
import { PriorityChecklist } from "./_components/priority-checklist";

export default function BerandaPage() {
  const { data, calc, fund, canWrite, putItem, openForm } = usePlanner();

  const groom = nameA(data);
  const bride = nameB(data);
  const weddingDate = data.settings.weddingDate;
  const fd = fund;

  const handleToggleTask = (task: Task, done: boolean) => {
    putItem("checklist", { ...task, done, status: done ? "Selesai" : "Belum Dimulai" });
  };

  const tasks: Task[] = Object.values(data.checklist || {});
  const notes = Object.values(data.notes || {}) as Array<{
    id: string; note?: string; topic?: string; pic?: string; due?: string; dueTime?: string; status?: string;
  }>;
  const openNotes = notes.filter((n) => n.status !== "Selesai");

  return (
    <div className="bn">
      {/* Mobile Header */}
      <header className="bn-mh">
        <button className="bn-hb" type="button" aria-label="Buka menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="bn-logo">
          <b>{groom} &amp; {bride}</b>
          <span>Wedding planner</span>
        </div>
        <span className="bn-hs" />
      </header>

      {/* Sapaan dan hitung mundur */}
      <CountdownBanner
        weddingDate={weddingDate}
        groomName={groom}
        brideName={bride}
      />

      {/* Akses Cepat */}
      {canWrite && (
        <section className="bn-quick" aria-label="Akses cepat">
          <div className="bn-qt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
            <h2>Akses Cepat</h2>
          </div>
          <div className="bn-qg">
            <button className="bn-qb" type="button" onClick={() => openForm("task")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Tugas</span>
            </button>
            <button className="bn-qb" type="button" onClick={() => openForm("saving")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
              <span>Catat Setoran</span>
            </button>
            <button className="bn-qb" type="button" onClick={() => openForm("expense")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Catat Pembayaran</span>
            </button>
            <button className="bn-qb" type="button" onClick={() => openForm("guest")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Tambah Tamu</span>
            </button>
          </div>
        </section>
      )}

      {/* Main cards: Savings, Estimasi, Progress, Mahar, Dokumen, Kategori */}
      <ExecutiveStats
        data={data}
        calc={calc}
        fund={fd}
        target={+(data.settings.target ?? 0)}
        canWrite={canWrite}
        onOpenTarget={() => openForm("target")}
      />

      {/* Prioritas & Follow Up */}
      <PriorityChecklist
        tasks={tasks}
        onToggleTask={handleToggleTask}
        canWrite={canWrite}
        notes={openNotes}
      />

      {/* Export backup */}
      <section className="bn-bk">
        <div>
          <b>Cadangan data</b>
          <span>Unduh seluruh data dalam satu file JSON.</span>
        </div>
        <button
          className="btn sm"
          type="button"
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `wedding-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {" "}Export Data
        </button>
      </section>

      {/* Bottom floral ornament */}
      <img className="bn-fl-bot" src={BNFL.border} alt="" aria-hidden="true" />
    </div>
  );
}
