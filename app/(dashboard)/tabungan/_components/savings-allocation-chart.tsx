"use client";

import { fmt, pct } from "@/components/planner/data/helpers";
import type { Investment } from "@/components/planner/data/types";

interface SavingsAllocationChartProps {
  totalAssets: number;
  placements: Investment[];
}

const INST_COLORS: Record<string, string> = {
  Bank: "bg-blue-500",
  RDPT: "bg-emerald-500",
  Emas: "bg-amber-500",
  Saham: "bg-purple-500",
  Cash: "bg-teal-500",
};

export function SavingsAllocationChart({
  totalAssets,
  placements,
}: SavingsAllocationChartProps) {
  if (placements.length === 0 || totalAssets === 0) return null;

  return (
    <div className="section-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Alokasi Penempatan Aset</h3>
        <span className="text-xs text-muted">Total: {fmt(totalAssets)}</span>
      </div>

      <div className="h-3 w-full bg-neutral-100 rounded-full flex overflow-hidden">
        {placements.map((p) => {
          const share = pct(Number(p.amount) || 0, totalAssets);
          if (share === 0) return null;
          const bg = INST_COLORS[p.kind || "Bank"] || "bg-indigo-400";
          return (
            <div
              key={p.id}
              className={`h-full ${bg} transition-all`}
              style={{ width: `${share}%` }}
              title={`${p.name || p.kind}: ${fmt(Number(p.amount) || 0)} (${share}%)`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        {placements.map((p) => {
          const share = pct(Number(p.amount) || 0, totalAssets);
          const bg = INST_COLORS[p.kind || "Bank"] || "bg-indigo-400";
          return (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-muted">
              <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />
              <span className="font-medium text-foreground">{p.name || p.kind}</span>
              <span>({share}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
