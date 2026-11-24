"use client";

import { useEffect, useState } from "react";
import { pct } from "@/components/planner/data/helpers";
import { stOf } from "@/components/planner/data/calculations";
import type { Task } from "@/components/planner/data/types";

interface ChecklistPhaseGroupsProps {
  groups: Array<[string, Task[]]>;
  allTasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task, done: boolean) => void;
  onCycleTask: (task: Task) => void;
  canWrite: boolean;
  onShowTemplate?: () => void;
}

export function ChecklistPhaseGroups({
  groups,
  allTasks,
  onEditTask,
  onToggleTask,
  onCycleTask,
  canWrite,
  onShowTemplate,
}: ChecklistPhaseGroupsProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const toggleCollapse = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const stPill = (status: string, task: Task) => {
    let cls = "pill";
    if (status === "Selesai") cls = "pill ok";
    else if (status === "Dalam Proses") cls = "pill warn";

    return (
      <button
        type="button"
        className={cls}
        onClick={(e) => {
          e.stopPropagation();
          onCycleTask(task);
        }}
      >
        {status}
      </button>
    );
  };

  const dueTag = (due: string) => {
    const isLate = due < today;
    const isToday = due === today;
    const formatted = new Date(`${due}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    if (isLate) {
      return <span className="pill bad">Terlambat ({formatted})</span>;
    }
    if (isToday) {
      return <span className="pill warn">Hari ini ({formatted})</span>;
    }
    return <span>{formatted}</span>;
  };

  if (!groups.length) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <b>Tidak ada tugas</b>
        <p>Ubah filter, tambahkan tugas baru, atau pakai template.</p>
        {canWrite && onShowTemplate && (
          <button
            type="button"
            className="btn"
            style={{ marginTop: "12px" }}
            onClick={onShowTemplate}
          >
            Lihat template
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {groups.map(([cat, xs]) => {
        const isCollapsed = !!collapsed[cat];
        const catAll = allTasks.filter((x) => x.cat === cat);
        const dn = catAll.filter((x) => stOf(x) === "Selesai").length;
        const tot = catAll.length;
        const groupPct = pct(dn, tot);

        const sortedTasks = [...xs].sort((a, b) =>
          (a.due || "9").localeCompare(b.due || "9") || (a.o || 0) - (b.o || 0)
        );

        return (
          <section key={cat} className="card" style={{ marginBottom: "14px" }}>
            <button
              type="button"
              className="grp"
              aria-expanded={!isCollapsed}
              onClick={() => toggleCollapse(cat)}
            >
              <h3>{cat}</h3>
              <small className="num">
                {dn}/{tot}
              </small>
            </button>
            <div className="bar thin" style={{ margin: "0 4px 6px" }}>
              <i style={{ width: `${groupPct}%` }} />
            </div>

            {!isCollapsed && (
              <div className="list">
                {sortedTasks.map((t) => {
                  const s = stOf(t);
                  const isDone = s === "Selesai";

                  return (
                    <div
                      key={t.id}
                      className={`row click ${isDone ? "done" : ""}`}
                      onClick={() => canWrite && onEditTask(t)}
                    >
                      <button
                        type="button"
                        className="cb"
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label="Tandai selesai"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(t, !isDone);
                        }}
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

                      <div className="main">
                        <div className="t">{String(t.task || t.title || "Tugas")}</div>
                        <div className="m">
                          {stPill(s, t)}
                          {t.pri && t.pri !== "Sedang" && (
                            <span className="pill warn">{t.pri}</span>
                          )}
                          {t.pic && <span>{t.pic}</span>}
                          {t.due &&
                            (isDone ? (
                              <span>
                                {new Date(`${t.due}T00:00:00`).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            ) : (
                              dueTag(t.due)
                            ))}
                          {t.note && <span>{t.note}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
