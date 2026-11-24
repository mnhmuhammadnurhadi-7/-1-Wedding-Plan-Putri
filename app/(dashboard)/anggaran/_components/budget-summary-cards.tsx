"use client";

import { fmt, pct } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";

interface BudgetSummaryCardsProps {
  plan: number;
  actual: number;
  paid: number;
  bill: number;
  diff: number;
  catCount: number;
  itemCount: number;
}

export function BudgetSummaryCards({
  plan,
  actual,
  paid,
  bill,
  diff,
  catCount,
  itemCount,
}: BudgetSummaryCardsProps) {
  const over = actual > plan;
  const actualPct = pct(actual, plan);

  return (
    <div className="grid g4" style={{ marginBottom: "16px" }}>
      <Tile
        tint="butter"
        label="Total estimasi"
        value={fmt(plan)}
        sub={`${catCount} kategori · ${itemCount} item`}
      />
      <Tile
        tint="rose"
        label="Total realisasi"
        value={fmt(actual)}
        sub={`Dibayar ${fmt(paid)} · belum ${fmt(bill)}`}
        progress={actualPct}
        tone={over ? "bad" : ""}
      />
      <Tile
        tint={diff < 0 ? "rose" : "sage"}
        label={diff < 0 ? "Melebihi estimasi" : "Sisa dari estimasi"}
        value={fmt(Math.abs(diff))}
        sub="Estimasi dikurangi realisasi"
        tone={diff < 0 ? "bad" : "ok"}
      />
      <Tile
        tint="lav"
        label="Tagihan belum dibayar"
        value={fmt(bill)}
        sub={bill > 0 ? "Perlu dilunasi" : "Tidak ada tagihan"}
      />
    </div>
  );
}
