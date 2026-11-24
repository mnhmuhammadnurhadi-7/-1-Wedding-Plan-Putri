"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { fmt, pct, rp } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";
import type { Gift } from "@/components/planner/data/types";

export default function MaharSeserahanPage() {
  const { data, calc, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const f = ui.gf;
  const all: Gift[] = calc.gifts;
  const q = (f.q || "").toLowerCase().trim();

  const items = all.filter((g) => {
    if (f.kind !== "Semua" && g.kind !== f.kind) return false;
    if (f.st !== "Semua" && g.status !== f.st) return false;
    if (q) {
      const match =
        (g.name || "").toLowerCase().includes(q) ||
        (g.desc || "").toLowerCase().includes(q) ||
        (g.group || "").toLowerCase().includes(q) ||
        (g.note || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCycleStatus = (g: Gift) => {
    const cur = g.status || "Belum Dibeli";
    const next =
      cur === "Belum Dibeli"
        ? "Dalam Proses"
        : cur === "Dalam Proses"
        ? "Sudah Dibeli"
        : "Belum Dibeli";
    putItem("gifts", { ...g, status: next });
  };

  const stPill = (status?: string, g?: Gift) => {
    let cls = "pill";
    if (status === "Sudah Dibeli") cls = "pill ok";
    else if (status === "Dalam Proses") cls = "pill warn";

    return (
      <button
        type="button"
        className={cls}
        onClick={(e) => {
          e.stopPropagation();
          if (g) handleCycleStatus(g);
        }}
      >
        {status || "Belum Dibeli"}
      </button>
    );
  };

  const priPill = (pri?: string) => {
    if (!pri || pri === "Sedang") return null;
    return <span className="pill warn">{pri}</span>;
  };

  const po: Record<string, number> = { Tinggi: 0, Sedang: 1, Rendah: 2 };
  const so: Record<string, number> = { "Belum Dibeli": 0, "Dalam Proses": 1, "Sudah Dibeli": 2 };

  const sortedItems = [...items].sort(
    (a, b) =>
      (so[a.status || "Belum Dibeli"] ?? 0) - (so[b.status || "Belum Dibeli"] ?? 0) ||
      (po[a.pri || "Sedang"] ?? 1) - (po[b.pri || "Sedang"] ?? 1)
  );

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Mahar &amp; Seserahan</h1>
          <p>Daftar barang yang akan dibeli. Catatan terpisah dari Estimasi Pengeluaran</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("gift")}
            >
              Tambah mahar / seserahan
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid g4" style={{ marginBottom: "16px" }}>
        <Tile
          label="Total estimasi"
          value={fmt(calc.gEst)}
          sub={`${all.length} barang`}
        />
        <Tile
          label="Total aktual"
          value={fmt(calc.gActAll)}
          sub={calc.gEst ? `${pct(calc.gActAll, calc.gEst)}% dari estimasi` : ""}
          progress={pct(calc.gActAll, calc.gEst)}
          tone={calc.gActAll > calc.gEst ? "bad" : ""}
        />
        <Tile
          label="Sudah dibeli"
          value={`${calc.gBought} / ${all.length}`}
          sub={`${all.filter((g) => g.status === "Dalam Proses").length} dalam proses`}
          progress={pct(calc.gBought, all.length || 1)}
          tone="ok"
        />
        <Tile
          label="Belum dibeli"
          value={all.filter((g) => g.status === "Belum Dibeli").length}
          sub={`${all.filter((g) => g.status === "Belum Dibeli" && g.pri === "Tinggi").length} prioritas tinggi`}
        />
      </div>

      {/* Tools: Seg, Search, Sel */}
      <div className="tools">
        <div className="seg">
          {[
            ["Semua", "Semua"],
            ["Mahar", "Mahar"],
            ["Seserahan", "Seserahan"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={f.kind === v}
              onClick={() => setFilter("gf", "kind", v)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Cari barang atau kotak"
            value={f.q || ""}
            onChange={(e) => setFilter("gf", "q", e.target.value)}
          />
        </div>

        <select
          className="sel"
          value={f.st || "Semua"}
          onChange={(e) => setFilter("gf", "st", e.target.value)}
          aria-label="Filter status"
        >
          {["Semua", "Belum Dibeli", "Dalam Proses", "Sudah Dibeli"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {sortedItems.length > 0 ? (
        <section className="card">
          <div className="list">
            {sortedItems.map((g) => {
              const a = calc.gAct(g);
              const isDone = g.status === "Sudah Dibeli";

              return (
                <div
                  key={g.id}
                  className={`row click ${isDone ? "done" : ""}`}
                  onClick={() => canWrite && openForm("gift", g)}
                >
                  {g.photo && (
                    <img
                      className="thumb"
                      src={g.photo}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="main">
                    <div className="t">{g.name}</div>
                    <div className="m">
                      {stPill(g.status, g)}
                      {priPill(g.pri)}
                      {g.group && <span>{g.group}</span>}
                      {g.desc && <span>{g.desc}</span>}
                      {calc.linked(g) && (
                        <span className="pill acc">Terhubung ke anggaran</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="amt num">{a ? fmt(a) : "–"}</div>
                    <div className="note num">est. {g.est ? fmt(Number(g.est)) : "–"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="empty" style={{ padding: "32px 16px" }}>
          <b>{all.length ? "Tidak ada barang" : "Belum ada barang"}</b>
          <p>Tambahkan mahar atau seserahan pertama.</p>
          {canWrite && (
            <button
              type="button"
              className="btn pri"
              style={{ marginTop: "12px" }}
              onClick={() => openForm("gift")}
            >
              + Tambah barang
            </button>
          )}
        </div>
      )}
    </div>
  );
}
