"use client";

interface GuestFiltersProps {
  groups: string[];
  activeGroup: string;
  onGroupChange: (grp: string) => void;
  guestCountsByGroup: Record<string, number>;
  query: string;
  onQueryChange: (q: string) => void;
  sides: Array<[string, string]>;
  activeSide: string;
  onSideChange: (side: string) => void;
  activeRsvp: string;
  onRsvpChange: (rsvp: string) => void;
}

const RSVP_OPTIONS = ["Semua", "Belum", "Hadir", "Tidak Hadir"];

export function GuestFilters({
  groups,
  activeGroup,
  onGroupChange,
  guestCountsByGroup,
  query,
  onQueryChange,
  sides,
  activeSide,
  onSideChange,
  activeRsvp,
  onRsvpChange,
}: GuestFiltersProps) {
  return (
    <>
      {/* Group Chips */}
      <div className="chips">
        {["Semua", ...groups].map((g) => {
          const count = g !== "Semua" ? guestCountsByGroup[g] ?? 0 : null;
          return (
            <button
              key={g}
              type="button"
              className="chip"
              aria-pressed={activeGroup === g}
              onClick={() => onGroupChange(g)}
            >
              {g}
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
            placeholder="Cari nama, meja, atau nomor"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <select
          className="sel"
          value={activeSide}
          onChange={(e) => onSideChange(e.target.value)}
          aria-label="Filter pihak"
        >
          {sides.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <div className="seg">
          {RSVP_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={activeRsvp === s}
              onClick={() => onRsvpChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
