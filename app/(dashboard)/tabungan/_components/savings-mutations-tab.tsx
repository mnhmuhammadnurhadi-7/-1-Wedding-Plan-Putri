"use client";

import { useState } from "react";
import { fmt } from "@/components/planner/data/helpers";
import { tabLabel } from "@/components/planner/data/calculations";
import type { FeedRow } from "@/components/planner/data/calculations";
import type { PlannerData, Saving } from "@/components/planner/data/types";

interface SavingsMutationsTabProps {
  feed: FeedRow[];
  groomName: string;
  brideName: string;
  data: PlannerData;
  onEditSaving: (item: Saving) => void;
  onAddSaving: () => void;
  canWrite: boolean;
}

const SVK: Record<string, [string, string]> = {
  setoran: ["Setoran", "ok"],
  penarikan: ["Penarikan", "bad"],
  penempatan: ["Penempatan", "warn"],
  pencairan: ["Pencairan", "acc"],
  alih: ["Perpindahan", ""],
};

const TYPES = [
  ["Semua", "Semua"],
  ["setoran", "Setoran"],
  ["penarikan", "Penarikan"],
  ["penempatan", "Penempatan"],
  ["pencairan", "Pencairan"],
  ["alih", "Perpindahan"],
];

export function SavingsMutationsTab({
  feed,
  groomName,
  brideName,
  data,
  onEditSaving,
  onAddSaving,
  canWrite,
}: SavingsMutationsTabProps) {
  const [whoFilter, setWhoFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");

  const filtered = feed.filter((e) => {
    if (typeFilter !== "Semua" && e.k !== typeFilter) return false;
    if (whoFilter !== "Semua" && e.who !== whoFilter) return false;
    return true;
  });

  return (
    <section className="card sv-panel">
      <div className="sv-ph">
        <div>
          <h2>Riwayat Transaksi</h2>
          <p className="note">
            Semua pergerakan dana, termasuk catatan lama. Ketuk baris untuk melihat atau mengubah.
          </p>
        </div>
        <div className="seg">
          {[
            ["Semua", "Semua"],
            [brideName, brideName],
            [groomName, groomName],
            ["Bersama", "Bersama"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={whoFilter === v}
              onClick={() => setWhoFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="chips">
        {TYPES.map(([v, l]) => {
          const count =
            v === "Semua" ? feed.length : feed.filter((e) => e.k === v).length;
          return (
            <button
              key={v}
              type="button"
              className="chip"
              aria-pressed={typeFilter === v}
              onClick={() => setTypeFilter(v)}
            >
              {l}
              <em>{count}</em>
            </button>
          );
        })}
      </div>

      <div className="list">
        {filtered.length > 0 ? (
          filtered.map((e, idx) => {
            const [lb, tn] = SVK[e.k] || ["Lainnya", ""];
            const isDep = e.k === "setoran";
            const isWd = e.k === "penarikan";
            const amtTxt = isDep
              ? "+" + fmt(e.a)
              : isWd
              ? "−" + fmt(e.a)
              : fmt(e.a);

            const dateStr = e.d
              ? new Date(`${e.d}T00:00:00`).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={idx}
                className="row click"
                onClick={() =>
                  canWrite &&
                  onEditSaving({ id: e.id, desc: e.t, amount: e.a, date: e.d, who: e.who } as Saving)
                }
              >
                <div className="main">
                  <div className="t">{e.t}</div>
                  <div className="m">
                    <span>{dateStr}</span>
                    <span>
                      {isDep || isWd ? tabLabel(data, e.who) : e.who || ""}
                    </span>
                    <span className={`pill ${tn}`}>{lb}</span>
                  </div>
                </div>
                <div
                  className="amt num"
                  style={{
                    color: isWd
                      ? "var(--bad)"
                      : isDep
                      ? "var(--ok)"
                      : undefined,
                  }}
                >
                  {amtTxt}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty" style={{ padding: "32px 16px" }}>
            <b>Belum ada transaksi</b>
            <p>Ubah filter atau catat transaksi tabungan pertama.</p>
            {canWrite && (
              <button
                type="button"
                className="btn pri"
                style={{ marginTop: "12px" }}
                onClick={onAddSaving}
              >
                + Catat Transaksi
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
