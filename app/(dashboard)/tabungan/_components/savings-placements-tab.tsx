"use client";

import { useState } from "react";
import { fmt } from "@/components/planner/data/helpers";
import { INSTR_COL } from "@/components/planner/data/assets";
import type { Investment } from "@/components/planner/data/types";

interface SavingsPlacementsTabProps {
  placements: Investment[];
  onEditPlacement: (item: Investment) => void;
  onAddPlacement: () => void;
  canWrite: boolean;
}

const KINDS = [
  "Semua",
  "Tabungan",
  "Deposito",
  "Obligasi / SBN",
  "Reksa Dana",
  "Saham / ETF",
  "Lainnya",
];

export function SavingsPlacementsTab({
  placements,
  onEditPlacement,
  onAddPlacement,
  canWrite,
}: SavingsPlacementsTabProps) {
  const [kindFilter, setKindFilter] = useState("Semua");

  const filtered = placements.filter((p) => {
    if (kindFilter !== "Semua" && p.kind !== kindFilter) return false;
    return true;
  });

  return (
    <section className="card sv-panel">
      <div className="sv-ph">
        <div>
          <h2>Penempatan Dana</h2>
          <p className="note">
            Daftar aset, rekening simpanan, dan portofolio investasi persiapan nikah.
          </p>
        </div>
      </div>

      <div className="chips">
        {KINDS.map((k) => {
          const count =
            k === "Semua"
              ? placements.length
              : placements.filter((p) => p.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              className="chip"
              aria-pressed={kindFilter === k}
              onClick={() => setKindFilter(k)}
            >
              {k}
              <em>{count}</em>
            </button>
          );
        })}
      </div>

      <div className="list">
        {filtered.length > 0 ? (
          filtered.map((p) => {
            const dateStr = p.date
              ? new Date(`${p.date}T00:00:00`).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-";
            const col = INSTR_COL[p.kind || ""] || "var(--dusty)";

            return (
              <div
                key={p.id}
                className="row click"
                onClick={() => canWrite && onEditPlacement(p)}
              >
                <div className="main">
                  <div className="t">
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: col,
                        marginRight: "8px",
                      }}
                    />
                    {p.name}
                  </div>
                  <div className="m">
                    <span>{p.kind}</span>
                    <span>{p.owner || "Bersama"}</span>
                    <span>Ditempatkan: {dateStr}</span>
                    {p.due && (
                      <span>
                        Jatuh tempo:{" "}
                        {new Date(`${p.due}T00:00:00`).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="amt num">{fmt(Number(p.amount) || 0)}</div>
                  {p.rate ? <span className="pill ok">{String(p.rate)}% p.a</span> : null}
                </div>
                {canWrite && (
                  <button
                    type="button"
                    className="btn sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPlacement(p);
                    }}
                  >
                    Ubah
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty" style={{ padding: "32px 16px" }}>
            <b>Belum ada penempatan dana</b>
            <p>Catat rekening atau instrumen penempatan pertama.</p>
            {canWrite && (
              <button
                type="button"
                className="btn pri"
                style={{ marginTop: "12px" }}
                onClick={onAddPlacement}
              >
                + Penempatan Baru
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
