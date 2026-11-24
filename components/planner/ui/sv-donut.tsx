import React from "react";
import { INSTR_COL } from "@/components/planner/data/assets";

export function SvDonut({
  alloc,
  tot,
}: {
  alloc: Array<{ k: string; v: number }>;
  tot: number;
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  let acc = 0;

  const valid = tot > 0 ? alloc.filter((a) => a.v > 0) : [];

  return (
    <svg className="sv-donut" viewBox="0 0 140 140" role="img" aria-label="Alokasi dana saat ini">
      <circle
        cx="70"
        cy="70"
        r={R}
        fill="none"
        stroke="rgba(140,83,98,.10)"
        strokeWidth="22"
      />
      {valid.map((a, idx) => {
        const len = (a.v / tot) * C;
        const currentAcc = acc;
        acc += len;
        const col = INSTR_COL[a.k] || "var(--c1)";

        return (
          <circle
            key={idx}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={col}
            strokeWidth="22"
            strokeDasharray={`${len.toFixed(2)} ${(C - len).toFixed(2)}`}
            strokeDashoffset={(-currentAcc).toFixed(2)}
            transform="rotate(-90 70 70)"
          />
        );
      })}
    </svg>
  );
}
