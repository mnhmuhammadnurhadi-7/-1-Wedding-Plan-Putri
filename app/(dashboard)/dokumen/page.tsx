"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { fmt, pct } from "@/components/planner/data/helpers";
import { nameA, nameB } from "@/components/planner/data/calculations";
import { Tile } from "@/components/planner/ui/tile";
import type { DocumentItem } from "@/components/planner/data/types";

export default function DokumenPage() {
  const { data, calc, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const f = ui.dk;
  const all: DocumentItem[] = Object.values(data.docs || {});
  const stages = Array.from(new Set(all.map((d) => d.stage).filter(Boolean))) as string[];
  const ada = all.filter((d) => d.have).length;
  const wajib = all.filter((d) => !d.have && d.req === "Ya").length;

  const groom = nameA(data);
  const bride = nameB(data);

  const q = (f.q || "").toLowerCase().trim();

  const items = all.filter((d) => {
    if (f.stage !== "Semua" && d.stage !== f.stage) return false;
    if (f.who !== "Semua" && d.who !== f.who) return false;
    if (q) {
      const match =
        (d.name || "").toLowerCase().includes(q) ||
        (d.desc || "").toLowerCase().includes(q) ||
        (d.note || "").toLowerCase().includes(q) ||
        (d.stage || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleToggleDoc = (doc: DocumentItem, have: boolean) => {
    putItem("docs", { ...doc, have });
  };

  const whoLabel = (who?: string) => {
    if (who === "Perempuan") return bride;
    if (who === "Laki-laki") return groom;
    return who || "Keduanya";
  };

  // Berkas dari modul lain
  const relVendors = calc.ven
    .filter((v) => v.contractUrl)
    .map((v) => ({
      kind: "Kontrak vendor",
      name: v.name,
      url: v.contractUrl!,
    }));
  const relExpenses = calc.exp
    .filter((e) => e.proof)
    .map((e) => ({
      kind: "Bukti pembayaran",
      name: `${e.desc} · ${fmt(Number(e.amount) || 0)}`,
      url: e.proof!,
    }));
  const relFiles = [...relVendors, ...relExpenses];

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Dokumen</h1>
          <p>Persyaratan administrasi dan arsip berkas</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("doc")}
            >
              Tambah dokumen
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid g4" style={{ marginBottom: "16px" }}>
        <Tile label="Total" value={all.length} />
        <Tile
          label="Sudah ada"
          value={ada}
          progress={pct(ada, all.length || 1)}
          tone="ok"
        />
        <Tile label="Belum" value={Math.max(0, all.length - ada)} />
        <Tile label="Wajib belum ada" value={wajib} />
      </div>

      {/* Chips Stage */}
      <div className="chips">
        {["Semua", ...stages].map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={f.stage === s}
            onClick={() => setFilter("dk", "stage", s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tools */}
      <div className="tools">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Cari dokumen"
            value={f.q || ""}
            onChange={(e) => setFilter("dk", "q", e.target.value)}
          />
        </div>

        <div className="seg">
          {[
            ["Semua", "Semua"],
            ["Perempuan", bride],
            ["Laki-laki", groom],
            ["Keduanya", "Keduanya"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={f.who === v}
              onClick={() => setFilter("dk", "who", v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stages Group Cards */}
      {stages.filter((s) => items.some((d) => d.stage === s)).map((s) => {
        const stageItems = items.filter((d) => d.stage === s);
        const stageAll = all.filter((d) => d.stage === s);
        const stageDone = stageAll.filter((d) => d.have).length;

        return (
          <section key={s} className="card" style={{ marginBottom: "14px" }}>
            <div className="grp" style={{ cursor: "default" }}>
              <h3>{s}</h3>
              <small>
                {stageDone}/{stageAll.length}
              </small>
            </div>
            <div className="list">
              {stageItems.map((d) => (
                <div
                  key={d.id}
                  className={`row click ${d.have ? "done" : ""}`}
                  onClick={() => canWrite && openForm("doc", d)}
                >
                  <button
                    type="button"
                    className="cb"
                    role="checkbox"
                    aria-checked={!!d.have}
                    aria-label="Sudah ada"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDoc(d, !d.have);
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
                    <div className="t">{d.name}</div>
                    <div className="m">
                      <span className={`pill ${d.req === "Ya" ? "acc" : ""}`}>
                        {d.req === "Ya" ? "Wajib" : "Kondisional"}
                      </span>
                      <span>{whoLabel(d.who)}</span>
                      {d.qty && <span>{d.qty}</span>}
                      {d.file && (
                        <a
                          className="lk"
                          href={d.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Buka berkas
                        </a>
                      )}
                    </div>
                    {(d.desc || d.note) && (
                      <div className="note" style={{ marginTop: "3px" }}>
                        {[d.desc, d.note].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="empty" style={{ padding: "32px 16px" }}>
          <b>Tidak ada dokumen</b>
          <p>Ubah filter atau tambahkan dokumen.</p>
          {canWrite && (
            <button
              type="button"
              className="btn pri"
              style={{ marginTop: "12px" }}
              onClick={() => openForm("doc")}
            >
              + Tambah dokumen
            </button>
          )}
        </div>
      )}

      {/* Berkas dari modul lain */}
      <div className="sec">
        <h2>Berkas dari modul lain</h2>
        <small>Kontrak vendor dan bukti pembayaran</small>
      </div>
      <section className="card">
        <div className="list">
          {relFiles.length > 0 ? (
            relFiles.map((rf, idx) => (
              <div key={idx} className="row">
                <div className="main">
                  <div className="t">{rf.name}</div>
                  <div className="m">
                    <span>{rf.kind}</span>
                  </div>
                </div>
                <a
                  className="btn sm"
                  href={rf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka
                </a>
              </div>
            ))
          ) : (
            <div className="empty">
              <b>Belum ada berkas</b>
              <p>Lampirkan kontrak di Vendor atau bukti transaksi di Anggaran, dan berkasnya muncul di sini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
