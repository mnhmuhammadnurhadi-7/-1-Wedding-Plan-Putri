"use client";

interface NotesFiltersProps {
  types: string[];
  activeType: string;
  onTypeChange: (t: string) => void;
  typeCounts: Record<string, number>;
  query: string;
  onQueryChange: (q: string) => void;
  activeStatus: "Open" | "Selesai" | "Semua";
  onStatusChange: (s: "Open" | "Selesai" | "Semua") => void;
  pics: string[];
  activePic: string;
  onPicChange: (p: string) => void;
}

export function NotesFilters({
  types,
  activeType,
  onTypeChange,
  typeCounts,
  query,
  onQueryChange,
  activeStatus,
  onStatusChange,
  pics,
  activePic,
  onPicChange,
}: NotesFiltersProps) {
  return (
    <>
      {/* Types chips */}
      <div className="chips">
        {["Semua", ...types].map((t) => {
          const count = t !== "Semua" ? typeCounts[t] ?? 0 : null;
          return (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={activeType === t}
              onClick={() => onTypeChange(t)}
            >
              {t}
              {count !== null && <em>{count}</em>}
            </button>
          );
        })}
      </div>

      {/* Tools */}
      <div className="tools">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Cari catatan"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <div className="seg">
          {[
            ["Open", "Terbuka"],
            ["Selesai", "Selesai"],
            ["Semua", "Semua"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={activeStatus === v}
              onClick={() => onStatusChange(v as "Open" | "Selesai" | "Semua")}
            >
              {l}
            </button>
          ))}
        </div>

        {pics.length > 0 && (
          <div className="seg">
            {["Semua", ...pics].map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={activePic === p}
                onClick={() => onPicChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
