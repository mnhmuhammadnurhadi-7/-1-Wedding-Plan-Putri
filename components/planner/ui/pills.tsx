import { dFmt, todayISO } from "../data/helpers";

export function Pill({
  children,
  tone = "",
  className = "",
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return <span className={`pill ${tone} ${className}`.trim()}>{children}</span>;
}

export function StatusPill({
  status,
  onCycle,
  disabled,
}: {
  status: string;
  onCycle?: () => void;
  disabled?: boolean;
}) {
  const tone =
    status === "Selesai" || status === "Sudah Dibeli"
      ? "ok"
      : status === "Dalam Proses"
        ? "warn"
        : "";
  if (!onCycle) return <Pill tone={tone}>{status}</Pill>;
  return (
    <button
      type="button"
      className={`pill ${tone}`.trim()}
      onClick={onCycle}
      disabled={disabled}
      title="Ketuk untuk mengubah status"
    >
      {status}
    </button>
  );
}

export function PriorityPill({ priority }: { priority?: string }) {
  if (priority === "Tinggi") return <Pill tone="bad">Tinggi</Pill>;
  if (priority === "Rendah") return <Pill>Rendah</Pill>;
  return <Pill tone="acc">Sedang</Pill>;
}

export function DueTag({ due, time }: { due?: string; time?: string }) {
  if (!due) return null;
  const delta = Math.round(
    (new Date(`${due}T00:00:00`).getTime() -
      new Date(`${todayISO()}T00:00:00`).getTime()) /
      864e5,
  );
  const suffix = time ? ` · ${time}` : "";
  if (delta === 0) return <Pill tone="warn">Hari ini{suffix}</Pill>;
  if (delta > 0 && delta <= 7)
    return (
      <Pill tone="warn">
        {delta} hari lagi{suffix}
      </Pill>
    );
  return (
    <Pill>
      {dFmt(due, { day: "numeric", month: "short", year: "numeric" })}
      {suffix}
    </Pill>
  );
}
