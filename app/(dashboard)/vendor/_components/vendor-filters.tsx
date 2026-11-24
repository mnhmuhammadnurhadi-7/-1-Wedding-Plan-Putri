"use client";

interface VendorFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  statuses: string[];
  activeStatus: string;
  onStatusChange: (value: string) => void;
}

export function VendorFilters({ query, onQueryChange, categories, activeCategory, onCategoryChange, statuses, activeStatus, onStatusChange }: VendorFiltersProps) {
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
      <select aria-label="Filter kategori vendor" value={activeCategory} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="Semua">Semua kategori</option>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      <select aria-label="Filter status vendor" value={activeStatus} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="Semua">Semua status</option>
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
    </div>
  );
}
