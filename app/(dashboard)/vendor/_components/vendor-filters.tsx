"use client";

interface VendorFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function VendorFilters({ query, onQueryChange }: VendorFiltersProps) {
  return (
    <div className="tools">
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Cari vendor atau kategori"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}
