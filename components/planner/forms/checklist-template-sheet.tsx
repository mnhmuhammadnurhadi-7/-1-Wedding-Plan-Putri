"use client";

import { useMemo, useState } from "react";
import { CHECKLIST_TEMPLATE, EVL } from "../data/constants";
import {
  addDays,
  uid,
} from "../data/helpers";
import { usePlanner } from "../data/planner-store";
import type { PlannerItem } from "../data/types";
import { Sheet } from "../ui/sheet";

export function ChecklistTemplateSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const { data, putMany, nextOrder, toast } = usePlanner();
  const existing = useMemo(
    () =>
      new Set(
        Object.values(data.checklist).map((task) =>
          `${task.cat || ""}|${task.task || ""}`.toLowerCase(),
        ),
      ),
    [data.checklist],
  );
  const [selected, setSelected] = useState<Set<number>>(
    () =>
      new Set(
        CHECKLIST_TEMPLATE.map((task, index) => ({ task, index }))
          .filter(
            ({ task }) =>
              !existing.has(`${task[1]}|${task[2]}`.toLowerCase()),
          )
          .map(({ index }) => index),
      ),
  );

  const toggle = (index: number) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const add = () => {
    const rows = [...selected]
      .sort((a, b) => a - b)
      .map((index) => CHECKLIST_TEMPLATE[index]);
    if (!rows.length) {
      toast("Pilih minimal satu tugas");
      return;
    }
    const weddingDate = data.settings.weddingDate;
    let order = nextOrder("checklist");
    putMany(
      "checklist",
      rows.map((task) => ({
        id: `${uid("c")}${Math.random().toString(36).slice(2, 4)}`,
        o: order++,
        cat: task[1],
        task: task[2],
        event: task[0],
        status: "Belum Dimulai",
        done: false,
        pri: "Sedang",
        pic: "",
        due: weddingDate ? addDays(weddingDate, task[3]) : "",
        note: "",
      })) as PlannerItem[],
    );
    toast(`${rows.length} tugas ditambahkan`);
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <h2>Template checklist</h2>
      <p className="note" style={{ marginTop: -8 }}>
        Daftar referensi tugas pernikahan. Tenggat dihitung dari tanggal
        pernikahan dan bisa diubah setelah ditambahkan.
      </p>
      <div id="tplbox">
        {Object.entries(EVL).map(([event, label]) => {
          const rows = CHECKLIST_TEMPLATE.map((task, index) => ({
            task,
            index,
          })).filter(({ task }) => task[0] === event);
          if (!rows.length) return null;
          return (
            <div key={event}>
              <div className="eyebrow" style={{ margin: "14px 0 4px" }}>
                {label}
              </div>
              {rows.map(({ task, index }) => {
                const has = existing.has(
                  `${task[1]}|${task[2]}`.toLowerCase(),
                );
                return (
                  <label
                    className={`tpl ${has ? "dis" : ""}`.trim()}
                    key={`${task[1]}-${task[2]}`}
                  >
                    <input
                      type="checkbox"
                      checked={has || selected.has(index)}
                      disabled={has}
                      onChange={() => toggle(index)}
                    />
                    <span>
                      {task[2]}
                      <small>
                        {task[1]} · {task[3] < 0 ? `H-${-task[3]}` : `H+${task[3]}`}
                        {has ? " · sudah ada" : ""}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="acts">
        <button type="button" className="btn" onClick={onClose}>
          Batal
        </button>
        <button type="button" className="btn pri" onClick={add}>
          Tambahkan terpilih
        </button>
      </div>
    </Sheet>
  );
}
