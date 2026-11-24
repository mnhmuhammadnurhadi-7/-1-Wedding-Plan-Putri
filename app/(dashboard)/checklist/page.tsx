"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { nameA, nameB, evOf, stOf } from "@/components/planner/data/calculations";
import { pct } from "@/components/planner/data/helpers";
import type { Task } from "@/components/planner/data/types";
import { ChecklistFilters } from "./_components/checklist-filters";
import { ChecklistPhaseGroups } from "./_components/checklist-phase-groups";

export default function ChecklistPage() {
  const { data, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const f = ui.cl;
  const all: Task[] = Object.values(data.checklist || {});
  const cats = Array.from(new Set(all.map((x) => x.cat).filter(Boolean))) as string[];

  const groom = nameA(data);
  const bride = nameB(data);

  const pics: Array<[string, string]> = [
    ["Semua", "Semua PIC"],
    [bride, bride],
    [groom, groom],
    ["Bersama", "Bersama"],
    ["-", "Belum ditentukan"],
  ];

  const q = (f.q || "").toLowerCase().trim();

  const items = all.filter((x) => {
    if (f.ev !== "Semua" && evOf(x) !== f.ev) return false;
    if (f.cat !== "Semua" && x.cat !== f.cat) return false;
    const s = stOf(x);
    if (f.st === "Belum Selesai" && s === "Selesai") return false;
    if (f.st !== "Semua" && f.st !== "Belum Selesai" && s !== f.st) return false;
    if (f.pic === "-") {
      if (x.pic) return false;
    } else if (f.pic !== "Semua") {
      if (x.pic !== f.pic) return false;
    }
    if (q) {
      const match =
        String(x.task || "").toLowerCase().includes(q) ||
        String(x.title || "").toLowerCase().includes(q) ||
        String(x.cat || "").toLowerCase().includes(q) ||
        String(x.pic || "").toLowerCase().includes(q) ||
        String(x.note || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const groups = cats
    .map((cat) => [cat, items.filter((x) => x.cat === cat)] as [string, Task[]])
    .filter((g) => g[1].length > 0);

  const done = all.filter((x) => stOf(x) === "Selesai").length;
  const proc = all.filter((x) => stOf(x) === "Dalam Proses").length;
  const completionPct = pct(done, all.length || 1);

  const catUnfinishedCounts: Record<string, number> = {};
  cats.forEach((cat) => {
    catUnfinishedCounts[cat] = all.filter(
      (x) => x.cat === cat && stOf(x) !== "Selesai"
    ).length;
  });

  const handleToggleTask = (task: Task, isDone: boolean) => {
    putItem("checklist", {
      ...task,
      done: isDone,
      status: isDone ? "Selesai" : "Belum Dimulai",
    });
  };

  const handleCycleTask = (task: Task) => {
    const cur = stOf(task);
    const next =
      cur === "Belum Dimulai"
        ? "Dalam Proses"
        : cur === "Dalam Proses"
        ? "Selesai"
        : "Belum Dimulai";
    putItem("checklist", {
      ...task,
      status: next,
      done: next === "Selesai",
    });
  };

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Checklist</h1>
          <p>{done} dari {all.length} tugas selesai</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn"
              onClick={() => openForm("list")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              {" "}Template
            </button>
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("task")}
            >
              Tambah tugas
            </button>
          </div>
        )}
      </div>

      {/* Progress card */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          <b className="num">{completionPct}% selesai</b>
          <span className="note">
            {done} selesai · {proc} dalam proses · {Math.max(0, all.length - done - proc)} belum dimulai
          </span>
        </div>
        <div className="bar" style={{ marginTop: "10px" }}>
          <i style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Filter controls */}
      <ChecklistFilters
        activeEvent={f.ev || "Semua"}
        onEventChange={(ev) => setFilter("cl", "ev", ev)}
        categories={cats}
        activeCat={f.cat || "Semua"}
        onCatChange={(cat) => setFilter("cl", "cat", cat)}
        catUnfinishedCounts={catUnfinishedCounts}
        query={f.q || ""}
        onQueryChange={(qVal) => setFilter("cl", "q", qVal)}
        pics={pics}
        activePic={f.pic || "Semua"}
        onPicChange={(picVal) => setFilter("cl", "pic", picVal)}
        statusFilter={f.st || "Semua"}
        onStatusChange={(stVal) => setFilter("cl", "st", stVal)}
      />

      {/* Phase groups */}
      <ChecklistPhaseGroups
        groups={groups}
        allTasks={all}
        onEditTask={(task) => openForm("task", task)}
        onToggleTask={handleToggleTask}
        onCycleTask={handleCycleTask}
        canWrite={canWrite}
        onShowTemplate={() => openForm("list")}
      />
    </div>
  );
}
