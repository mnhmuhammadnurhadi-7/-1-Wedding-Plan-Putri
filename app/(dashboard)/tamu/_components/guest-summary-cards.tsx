"use client";

import { pct } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";

interface GuestSummaryCardsProps {
  totalGuests: number;
  totalPax: number;
  sentCount: number;
  hadirCount: number;
  tidakCount: number;
  belumCount: number;
  hadirOrang: number;
  target?: number;
}

export function GuestSummaryCards({
  totalGuests,
  totalPax,
  sentCount,
  hadirCount,
  tidakCount,
  belumCount,
  hadirOrang,
  target,
}: GuestSummaryCardsProps) {
  return (
    <div className="grid g5" style={{ marginBottom: "16px" }}>
      <Tile
        label="Undangan"
        value={totalGuests}
        sub={`${totalPax} orang diundang${target ? ` · target ${target}` : ""}`}
        progress={target ? pct(totalGuests, target) : null}
      />
      <Tile
        label="Terkirim"
        value={sentCount}
        sub={`${totalGuests - sentCount} belum dikirim`}
        progress={pct(sentCount, totalGuests || 1)}
      />
      <Tile
        label="RSVP hadir"
        value={hadirCount}
        sub={`${hadirOrang} orang terkonfirmasi`}
        progress={pct(hadirCount, totalGuests || 1)}
        tone="ok"
      />
      <Tile
        label="RSVP tidak hadir"
        value={tidakCount}
      />
      <Tile
        label="Belum RSVP"
        value={belumCount}
      />
    </div>
  );
}
