"use client";

import { fmt, pct, rp } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";

interface VendorSummaryCardsProps {
  totalCount: number;
  totalCost: number;
  totalPaid: number;
  bookedCount: number;
  lunasCount: number;
}

export function VendorSummaryCards({
  totalCount,
  totalCost,
  totalPaid,
  bookedCount,
  lunasCount,
}: VendorSummaryCardsProps) {
  const paidPct = pct(totalPaid, totalCost);
  const remaining = Math.max(0, totalCost - totalPaid);

  return (
    <div className="grid g4" style={{ marginBottom: "16px" }}>
      <Tile
        label="Vendor"
        value={totalCount}
        sub={`${bookedCount} booked · ${lunasCount} lunas`}
      />
      <Tile
        label="Total kesepakatan"
        value={fmt(totalCost)}
      />
      <Tile
        label="Sudah dibayar"
        value={fmt(totalPaid)}
        progress={paidPct}
      />
      <Tile
        label="Sisa pembayaran"
        value={fmt(remaining)}
      />
    </div>
  );
}
