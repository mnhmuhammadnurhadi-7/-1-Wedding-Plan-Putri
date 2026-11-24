"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { pct } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";
import type { EventItem } from "@/components/planner/data/types";
import { RundownSessionTabs } from "./_components/rundown-session-tabs";
import { RundownTimelineList } from "./_components/rundown-timeline-list";

function mins(t?: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return isNaN(h) || isNaN(m) ? null : h * 60 + m;
}

function durTxt(start?: string, end?: string): string {
  if (!start || !end) return "";
  const m1 = mins(start);
  const m2 = mins(end);
  if (m1 == null || m2 == null || m2 <= m1) return "";
  const diff = m2 - m1;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} mnt`;
  if (h > 0) return `${h} jam`;
  return `${m} menit`;
}

export default function AcaraPage() {
  const { data, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const kind = (ui.ac.kind === "Resepsi" ? "Resepsi" : "Akad Nikah") as "Akad Nikah" | "Resepsi";
  const allEvents: EventItem[] = Object.values(data.events || {});

  const items = allEvents
    .filter((e) => (e.kind === kind || (kind === "Akad Nikah" && e.kind === "Akad")))
    .sort((a, b) => (mins(a.start) ?? 9999) - (mins(b.start) ?? 9999) || (a.o || 0) - (b.o || 0));

  const weddingDate = data.settings.weddingDate;
  const done = items.filter((e) => e.status === "Selesai").length;
  const first = items.find((e) => e.start);
  const last = [...items].reverse().find((e) => e.end || e.start);
  const span = first && last ? durTxt(first.start, last.end || last.start) : "";

  const handleCycleStatus = (event: EventItem) => {
    const isDone = event.status === "Selesai";
    putItem("events", {
      ...event,
      status: isDone ? "Belum Mulai" : "Selesai",
    });
  };

  const formattedDate = weddingDate
    ? new Date(`${weddingDate}T00:00:00`).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Susunan acara hari-H";

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Acara &amp; Rundown</h1>
          <p>{formattedDate}</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("event", { id: "", kind } as any)}
            >
              Tambah agenda
            </button>
          </div>
        )}
      </div>

      {/* Session tabs: Akad Nikah / Resepsi */}
      <RundownSessionTabs
        activeSession={kind}
        onSessionChange={(s) => setFilter("ac", "kind", s)}
      />

      {/* 3 Summary Tiles */}
      <div className="grid g3" style={{ marginBottom: "22px" }}>
        <Tile
          label="Agenda"
          value={items.length}
          sub={`${done} selesai`}
          progress={pct(done, items.length || 1)}
          tone="ok"
        />
        <Tile
          label="Mulai"
          value={first?.start || "–"}
          sub={first?.name || ""}
        />
        <Tile
          label="Rentang waktu"
          value={span || "–"}
          sub={last?.end ? `sampai ${last.end}` : ""}
        />
      </div>

      {/* Timeline */}
      <RundownTimelineList
        events={items}
        onEditEvent={(event) => openForm("event", event)}
        onCycleStatus={handleCycleStatus}
        onAddEvent={() => openForm("event", { id: "", kind } as any)}
        canWrite={canWrite}
        kind={kind}
      />
    </div>
  );
}
