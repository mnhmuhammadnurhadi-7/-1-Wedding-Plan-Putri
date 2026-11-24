"use client";

interface BudgetFiltersProps {
  activeTab: "banding" | "riwayat";
  onTabChange: (tab: "banding" | "riwayat") => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export function BudgetFilters({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
}: BudgetFiltersProps) {
  return (
    <div className="tools">
      <div className="seg">
        <button
          type="button"
          aria-pressed={activeTab === "banding"}
          onClick={() => onTabChange("banding")}
        >
          Estimasi vs Realisasi
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "riwayat"}
          onClick={() => onTabChange("riwayat")}
        >
          Riwayat realisasi
        </button>
      </div>
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Cari item atau transaksi"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}
