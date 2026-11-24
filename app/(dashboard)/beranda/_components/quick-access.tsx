"use client";

import Link from "next/link";

interface QuickAccessProps {
  canWrite: boolean;
  onAddTask?: () => void;
  onAddSaving?: () => void;
  onAddExpense?: () => void;
  onAddGuest?: () => void;
}

export function QuickAccess({
  canWrite,
  onAddTask,
  onAddSaving,
  onAddExpense,
  onAddGuest,
}: QuickAccessProps) {
  if (!canWrite) return null;

  return (
    <section className="bn-quick" aria-label="Akses cepat">
      <div className="bn-qt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
        <h2>Akses Cepat</h2>
      </div>
      <div className="bn-qg">
        <button className="bn-qb" onClick={onAddTask}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Tugas</span>
        </button>
        <button className="bn-qb" onClick={onAddSaving}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M19 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
            <circle cx="17" cy="17" r="3" />
            <path d="m19.5 19.5 1.5 1.5" />
          </svg>
          <span>Catat Setoran</span>
        </button>
        <button className="bn-qb" onClick={onAddExpense}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Catat Pembayaran</span>
        </button>
        <button className="bn-qb" onClick={onAddGuest}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Tambah Tamu</span>
        </button>
      </div>
    </section>
  );
}
