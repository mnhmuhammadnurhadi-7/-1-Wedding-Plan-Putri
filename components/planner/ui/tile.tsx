import type { ReactNode } from "react";

export function Tile({
  label,
  value,
  sub,
  progress,
  tone,
  tint,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  progress?: number | null;
  tone?: string;
  tint?: string;
}) {
  return (
    <div className={`card ${tint ? `tint ${tint}` : "sumcard"}`}>
      <div className="eyebrow">{label}</div>
      <div className="big">{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
      {progress != null ? (
        <div className={`bar ${tone || ""}`}>
          <i style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </div>
  );
}
