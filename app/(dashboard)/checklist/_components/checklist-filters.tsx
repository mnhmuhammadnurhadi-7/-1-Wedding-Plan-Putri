"use client";

interface ChecklistFiltersProps {
  activeEvent: string;
  onEventChange: (ev: string) => void;
  categories: string[];
  activeCat: string;
  onCatChange: (cat: string) => void;
  catUnfinishedCounts: Record<string, number>;
  query: string;
  onQueryChange: (q: string) => void;
  pics: Array<[string, string]>;
  activePic: string;
  onPicChange: (pic: string) => void;
  statusFilter: string;
  onStatusChange: (st: string) => void;
}

const EVENTS = [
  ["Semua", "Semua Tugas"],
  ["Akad", "Akad Nikah"],
  ["Resepsi", "Resepsi"],
  ["Umum", "Umum"],
];

const TSTAT = ["Semua", "Belum Selesai", "Belum Dimulai", "Dalam Proses", "Selesai"];

export function ChecklistFilters({
  activeEvent,
  onEventChange,
  categories,
  activeCat,
  onCatChange,
  catUnfinishedCounts,
  query,
  onQueryChange,
  pics,
  activePic,
  onPicChange,
  statusFilter,
  onStatusChange,
}: ChecklistFiltersProps) {
  return (
    <>
      {/* Event Segment */}
      <div className="seg" style={{ marginBottom: "14px" }}>
        {EVENTS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={activeEvent === v}
            onClick={() => onEventChange(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Category Chips */}
      <div className="chips cl-grid">
        {["Semua", ...categories].map((c) => {
          const count = c !== "Semua" ? catUnfinishedCounts[c] ?? 0 : null;
          return (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={activeCat === c}
              onClick={() => onCatChange(c)}
            >
              {c}
              {count !== null && <em>{count}</em>}
            </button>
          );
        })}
      </div>

      {/* Tools bar: Search + Selects */}
      <div className="tools">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Cari tugas"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <select
          className="sel"
          value={activePic}
          onChange={(e) => onPicChange(e.target.value)}
          aria-label="Filter penanggung jawab"
        >
          {pics.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <select
          className="sel"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter status"
        >
          {TSTAT.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
