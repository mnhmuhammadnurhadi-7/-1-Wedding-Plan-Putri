"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { noteType } from "@/components/planner/data/calculations";
import { NTYPES } from "@/components/planner/data/constants";
import { pct } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";
import type { Note } from "@/components/planner/data/types";
import { NotesFilters } from "./_components/notes-filters";
import { NotesGridCards } from "./_components/notes-grid-cards";

export default function CatatanPage() {
  const { data, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const f = ui.ct;
  const allNotes: Note[] = Object.values(data.notes || {});
  const openNotes = allNotes.filter((n) => n.status !== "Selesai");
  const pics = Array.from(new Set(allNotes.map((n) => n.pic).filter(Boolean))) as string[];

  const q = (f.q || "").toLowerCase().trim();

  const items = allNotes
    .filter((n) => {
      if (f.st === "Open" && n.status === "Selesai") return false;
      if (f.st === "Selesai" && n.status !== "Selesai") return false;
      if (f.pic !== "Semua" && n.pic !== f.pic) return false;
      if (f.type !== "Semua" && noteType(n) !== f.type) return false;
      if (q) {
        const match =
          (n.topic || "").toLowerCase().includes(q) ||
          (n.note || "").toLowerCase().includes(q) ||
          (n.follow || "").toLowerCase().includes(q) ||
          (n.pic || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        (a.status === "Selesai" ? 1 : 0) - (b.status === "Selesai" ? 1 : 0) ||
        (a.due || "9").localeCompare(b.due || "9")
    );

  const typeCounts: Record<string, number> = {};
  NTYPES.forEach((t) => {
    typeCounts[t] = allNotes.filter((n) => noteType(n) === t).length;
  });

  const handleToggleNote = (note: Note) => {
    const isDone = note.status === "Selesai";
    putItem("notes", {
      ...note,
      status: isDone ? "Open" : "Selesai",
    });
  };

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Catatan</h1>
          <p>Ide, hasil diskusi, keputusan keluarga, dan yang perlu dibahas</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("note")}
            >
              Tambah catatan
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid g4" style={{ marginBottom: "16px" }}>
        <Tile label="Total" value={allNotes.length} />
        <Tile label="Terbuka" value={openNotes.length} />
        <Tile
          label="Selesai"
          value={allNotes.length - openNotes.length}
          progress={pct(allNotes.length - openNotes.length, allNotes.length || 1)}
          tone="ok"
        />
        <Tile
          label="Punya tenggat"
          value={openNotes.filter((n) => n.due).length}
        />
      </div>

      {/* Filters */}
      <NotesFilters
        types={NTYPES}
        activeType={f.type || "Semua"}
        onTypeChange={(t) => setFilter("ct", "type", t)}
        typeCounts={typeCounts}
        query={f.q || ""}
        onQueryChange={(qVal) => setFilter("ct", "q", qVal)}
        activeStatus={(f.st || "Open") as "Open" | "Selesai" | "Semua"}
        onStatusChange={(sVal) => setFilter("ct", "st", sVal)}
        pics={pics}
        activePic={f.pic || "Semua"}
        onPicChange={(pVal) => setFilter("ct", "pic", pVal)}
      />

      {/* Grid Cards */}
      <NotesGridCards
        notes={items}
        onEditNote={(note) => openForm("note", note)}
        onToggleNote={handleToggleNote}
        onAddNote={() => openForm("note")}
        canWrite={canWrite}
      />
    </div>
  );
}
