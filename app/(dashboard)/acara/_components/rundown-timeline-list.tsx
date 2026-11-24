"use client";

import type { EventItem } from "@/components/planner/data/types";

interface RundownTimelineListProps {
  events: EventItem[];
  onEditEvent: (event: EventItem) => void;
  onCycleStatus: (event: EventItem) => void;
  onAddEvent: () => void;
  canWrite: boolean;
  kind: string;
}

function durTxt(start?: string, end?: string): string {
  if (!start || !end) return "";
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return "";
  const diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} mnt`;
  if (h > 0) return `${h} jam`;
  return `${m} menit`;
}

export function RundownTimelineList({
  events,
  onEditEvent,
  onCycleStatus,
  onAddEvent,
  canWrite,
  kind,
}: RundownTimelineListProps) {
  if (!events.length) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <b>Belum ada agenda {kind}</b>
        <p>Susun urutan acara satu per satu, atau mulai dari template lalu ubah sesuai rencana.</p>
        {canWrite && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
            <button type="button" className="btn pri" onClick={onAddEvent}>
              + Tambah agenda
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <ol className="tl">
      {events.map((e) => {
        const isDone = e.status === "Selesai";
        const dur = durTxt(e.start, e.end);

        return (
          <li key={e.id} className={isDone ? "done" : ""}>
            <div className="tm">
              {e.start || "--:--"}
              <small>
                {e.end ? `s/d ${e.end}` : ""}
                {dur && (
                  <>
                    <br />
                    {dur}
                  </>
                )}
              </small>
            </div>
            <span className="pt" />
            <div className={`card ${isDone ? "done" : ""}`}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <button
                  type="button"
                  className="cb"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label="Tandai selesai"
                  style={{ marginTop: "2px" }}
                  onClick={() => canWrite && onCycleStatus(e)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="16"
                    height="16"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <div
                  className="main click"
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  onClick={() => canWrite && onEditEvent(e)}
                >
                  <div className="t" style={{ fontWeight: 600, fontSize: "16px" }}>
                    {e.name}
                  </div>
                  <div
                    className="m note"
                    style={{ display: "flex", gap: "4px 12px", flexWrap: "wrap", marginTop: "4px" }}
                  >
                    {e.pic && <span>PIC: {e.pic}</span>}
                    {e.loc && <span>{e.loc}</span>}
                    <span className={`pill ${isDone ? "ok" : ""}`}>
                      {e.status || "Belum Dimulai"}
                    </span>
                  </div>
                  {e.note && <div className="note" style={{ marginTop: "6px" }}>{e.note}</div>}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
