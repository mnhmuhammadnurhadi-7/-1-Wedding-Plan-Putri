"use client";

import { useState } from "react";
import { RUNDOWN_TEMPLATE } from "../data/constants";
import { uid } from "../data/helpers";
import { usePlanner } from "../data/planner-store";
import type { PlannerItem } from "../data/types";
import { Sheet } from "../ui/sheet";

export function RundownTemplateSheet({
  kind,
  onClose,
}: {
  kind: string;
  onClose: () => void;
}) {
  const { putMany, nextOrder, toast } = usePlanner();
  const rows = RUNDOWN_TEMPLATE.map((task, index) => ({ task, index })).filter(
    ({ task }) => task[0] === kind,
  );
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(rows.map(({ index }) => index)),
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
    const picked = rows.filter(({ index }) => selected.has(index));
    if (!picked.length) {
      toast("Pilih minimal satu agenda");
      return;
    }
    let order = nextOrder("events");
    putMany(
      "events",
      picked.map(({ task }) => ({
        id: `${uid("r")}${Math.random().toString(36).slice(2, 4)}`,
        o: order++,
        kind: task[0],
        name: task[3],
        start: task[1],
        end: task[2],
        pic: task[4],
        loc: "",
        note: "",
        status: "Belum Dimulai",
      })) as PlannerItem[],
    );
    toast(`${picked.length} agenda ditambahkan`);
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <h2>Template rundown {kind}</h2>
      <p className="note" style={{ marginTop: -8 }}>
        Contoh urutan acara. Waktu dan PIC hanya patokan, ubah sesuai rencana
        keluarga setelah ditambahkan.
      </p>
      <div>
        {rows.map(({ task, index }) => (
          <label className="tpl" key={`${task[1]}-${task[3]}`}>
            <input
              type="checkbox"
              checked={selected.has(index)}
              onChange={() => toggle(index)}
            />
            <span>
              {task[3]}
              <small>
                {task[1]}–{task[2]} · {task[4]}
              </small>
            </span>
          </label>
        ))}
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
