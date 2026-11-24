import React from "react";

export interface BnDonutSeg {
  v: number;
  col: string;
}

export function BnDonut({
  segs,
  tot,
  c1,
  c2,
  label = "Chart",
}: {
  segs: BnDonutSeg[];
  tot: number;
  c1: string;
  c2?: string;
  label?: string;
}) {
  const R = 52;
  const C = 2 * Math.PI * R;
  let acc = 0;

  const validSegs = tot > 0 ? segs.filter((a) => a.v > 0) : [];

  return (
    <svg className="bn-donut" viewBox="0 0 140 140" role="img" aria-label={label}>
      <circle
        cx="70"
        cy="70"
        r={R}
        fill="none"
        stroke="rgba(140,83,98,.10)"
        strokeWidth="20"
      />
      {validSegs.map((a, idx) => {
        const len = (a.v / tot) * C;
        const currentAcc = acc;
        acc += len;
        return (
          <circle
            key={idx}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={a.col}
            strokeWidth="20"
            strokeDasharray={`${len.toFixed(2)} ${(C - len).toFixed(2)}`}
            strokeDashoffset={(-currentAcc).toFixed(2)}
            transform="rotate(-90 70 70)"
          />
        );
      })}
      <text x="70" y={c2 ? 66 : 74} textAnchor="middle" className="bn-dt1">
        {c1}
      </text>
      {c2 && (
        <text x="70" y="84" textAnchor="middle" className="bn-dt2">
          {c2}
        </text>
      )}
    </svg>
  );
}
