"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { fmt, pct, rp } from "@/components/planner/data/helpers";
import { FL, INSTR_COL } from "@/components/planner/data/assets";
import { SvDonut } from "@/components/planner/ui/sv-donut";
import { feedOf, nameA, nameB, tabLabel } from "@/components/planner/data/calculations";
import type { Investment, Saving } from "@/components/planner/data/types";
import { SavingsPlacementsTab } from "./_components/savings-placements-tab";
import { SavingsMutationsTab } from "./_components/savings-mutations-tab";

const INSTR = [
  "Tabungan",
  "Deposito",
  "Obligasi / SBN",
  "Reksa Dana",
  "Saham / ETF",
  "Lainnya",
];

export default function TabunganPage() {
  const { data, calc, fund: fd, ui, setFilter, canWrite, openForm } = usePlanner();

  const target = +(data.settings.target ?? 0);
  const tab = (ui.tb.tab === "riwayat" ? "riwayat" : "invest") as "invest" | "riwayat";

  const alloc = INSTR.map((k) => ({ k, v: Math.max(0, fd.byKind[k] || 0) }));
  const tot = alloc.reduce((s, a) => s + a.v, 0);
  const targetPct = pct(fd.net, target);

  const feed = feedOf(data, fd).slice(0, 5);

  const groom = nameA(data);
  const bride = nameB(data);

  return (
    <div className="sv-page">
      {/* Header */}
      <div className="head sv-head">
        <div>
          <h1>Savings – Dana Nikah</h1>
          <p>Catat setoran, penarikan, dan penempatan dana pernikahan.</p>
        </div>
        <img className="sv-fl sv-fl-head" src={FL.corner} alt="" aria-hidden="true" />
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn"
              onClick={() => openForm("saving")}
            >
              Catat Transaksi
            </button>
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("place")}
            >
              Penempatan Dana
            </button>
          </div>
        )}
      </div>

      {/* 3 Summary Cards */}
      <div className="sv-sumw">
        <div className="sv-sum">
          {/* Card 1: Total Dana Terkumpul */}
          <section className="card sv-card sv-c1">
            <img className="sv-fl sv-fl-c1" src={FL.peony} alt="" aria-hidden="true" />
            <div className="sv-in">
              <div className="sv-ct">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <circle cx="8" cy="8" r="6" /><path d="M18 10a6 6 0 0 0-6-6M8 14a6 6 0 0 0 6 6M16 16a6 6 0 0 0 6-6" />
                </svg>
                <h3>Total Dana Terkumpul</h3>
              </div>
              <div className="sv-big num">{rp(fd.net).full}</div>
              <div className="sub">
                {target ? `Target dana nikah ${fmt(target)}` : "Target dana nikah belum diatur"}
                {canWrite && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="lk"
                      style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}
                      onClick={() => openForm("target")}
                    >
                      {target ? "Ubah" : "Atur"}
                    </button>
                  </>
                )}
              </div>
              <div className="sv-prog">
                <div className="bar">
                  <i style={{ width: `${targetPct}%` }} />
                </div>
                <span className="pill acc">{targetPct}%</span>
              </div>
              <div className="sv-mini">
                <div>
                  <span className="sv-ml">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <circle cx="8" cy="8" r="6" />
                    </svg>
                    Total Setoran
                  </span>
                  <b className="num">{rp(fd.dep).full}</b>
                  {fd.wd > 0 && <small>setelah penarikan {fmt(fd.wd)}</small>}
                </div>
                <div>
                  <span className="sv-ml">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                    </svg>
                    Total Imbal Hasil
                  </span>
                  <b className="num" style={{ color: fd.gain < 0 ? "var(--bad)" : "var(--ok)" }}>
                    {fd.gain > 0 ? "+" : ""}
                    {rp(fd.gain).full}
                  </b>
                  {fd.unreal !== 0 && (
                    <small>termasuk {fd.unreal > 0 ? "+" : ""}{fmt(fd.unreal)} belum dicairkan</small>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Alokasi Dana Saat Ini */}
          <section className="card sv-card sv-c2">
            <div className="sv-ct">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <line x1="3" y1="21" x2="21" y2="21" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="5 6 12 3 19 6" /><line x1="4" y1="10" x2="4" y2="21" /><line x1="20" y1="10" x2="20" y2="21" />
              </svg>
              <h3>Alokasi Dana Saat Ini</h3>
            </div>
            <div className="sv-alloc">
              <SvDonut alloc={alloc} tot={tot} />
              <div className="sv-leg">
                {alloc.map((a, idx) => (
                  <div key={idx} className="sv-li">
                    <span className="sv-dot" style={{ background: INSTR_COL[a.k] || "var(--c1)" }} />
                    <span className="sv-ln">{a.k}</span>
                    <span className="sv-lp">{pct(a.v, tot)}%</span>
                    <span className="sv-la num">{fmt(a.v)}</span>
                  </div>
                ))}
              </div>
            </div>
            {tot <= 0 && (
              <div className="note" style={{ marginTop: "8px" }}>
                Belum ada dana tercatat. Catat setoran atau penempatan untuk melihat pembagiannya.
              </div>
            )}
          </section>

          {/* Card 3: Ringkasan Dana */}
          <section className="card sv-card sv-c3">
            <div className="sv-ct">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              </svg>
              <h3>Ringkasan Dana</h3>
            </div>
            <div className="kv">
              <span>Dana Terkumpul (setoran)</span>
              <b>{fmt(fd.net)}</b>
            </div>
            <div className="kv">
              <span>Dana Ditempatkan</span>
              <b>{fmt(fd.invested)}</b>
            </div>
            <div className="kv">
              <span>Dana Tersedia (Tabungan)</span>
              <b style={{ color: fd.avail < 0 ? "var(--bad)" : undefined }}>{fmt(fd.avail)}</b>
            </div>
            <div className="kv">
              <span>Total Imbal Hasil</span>
              <b style={{ color: fd.gain < 0 ? "var(--bad)" : "var(--ok)" }}>
                {fd.gain > 0 ? "+" : ""}
                {fmt(fd.gain)}
              </b>
            </div>
            <div className="kv sv-total">
              <span>Total Nilai Dana</span>
              <b>{fmt(fd.net + fd.gain)}</b>
            </div>
            {fd.avail < 0 && (
              <div className="warnbox" style={{ marginTop: "10px" }}>
                Dana tersedia minus. Periksa setoran atau penempatan yang tercatat.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Tabs */}
      <div className="sv-tabs" role="tablist">
        <button
          type="button"
          className="sv-tab"
          role="tab"
          aria-pressed={tab === "invest"}
          aria-selected={tab === "invest"}
          onClick={() => setFilter("tb", "tab", "invest")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="3" y1="21" x2="21" y2="21" /><polyline points="5 6 12 3 19 6" />
          </svg>
          <span>Penempatan Dana</span>
        </button>
        <button
          type="button"
          className="sv-tab"
          role="tab"
          aria-pressed={tab === "riwayat"}
          aria-selected={tab === "riwayat"}
          onClick={() => setFilter("tb", "tab", "riwayat")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
          </svg>
          <span>Riwayat Transaksi</span>
        </button>
      </div>

      {/* Tab Panels */}
      {tab === "invest" ? (
        <SavingsPlacementsTab
          placements={fd.inv}
          onEditPlacement={(item: Investment) => openForm("place", item)}
          onAddPlacement={() => openForm("place")}
          canWrite={canWrite}
        />
      ) : (
        <SavingsMutationsTab
          feed={feedOf(data, fd)}
          groomName={groom}
          brideName={bride}
          data={data}
          onEditSaving={(item: Saving) => openForm("saving", item)}
          onAddSaving={() => openForm("saving")}
          canWrite={canWrite}
        />
      )}

      {/* Bottom widgets: Pergerakan Dana Terakhir & Catatan Penting */}
      <div className="sv-bot">
        <section className="card sv-card sv-mv">
          <img className="sv-fl sv-fl-mv" src={FL.sprig} alt="" aria-hidden="true" />
          <div className="sv-in">
            <div className="sv-ct">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
              </svg>
              <h3>Pergerakan Dana Terakhir</h3>
            </div>
            <div className="list">
              {feed.length > 0 ? (
                feed.map((e, idx) => {
                  const dateStr = e.d
                    ? new Date(`${e.d}T00:00:00`).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";
                  const isDep = e.k === "setoran";
                  const isWd = e.k === "penarikan";

                  return (
                    <div
                      key={idx}
                      className="row click"
                      style={{ padding: "9px 4px" }}
                      onClick={() => canWrite && openForm(e.act === "editPlace" ? "place" : "saving", { id: e.id })}
                    >
                      <span className="sv-dt">{dateStr}</span>
                      <div className="main">
                        <div className="t" style={{ fontWeight: 400, fontSize: "14px" }}>
                          {e.t}
                          {!isDep && !isWd ? ` (${fmt(e.a)})` : ""}
                        </div>
                      </div>
                      {isDep || isWd ? (
                        <span
                          className="num"
                          style={{
                            fontWeight: 600,
                            color: isWd ? "var(--bad)" : "var(--ok)",
                          }}
                        >
                          {isWd ? "−" : "+"}
                          {fmt(e.a)}
                        </span>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="note" style={{ padding: "8px 4px" }}>
                  Belum ada pergerakan dana.
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                type="button"
                className="lk"
                style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}
                onClick={() => setFilter("tb", "tab", "riwayat")}
              >
                Lihat Semua Riwayat →
              </button>
            </div>
          </div>
        </section>

        <section className="card sv-card sv-nt">
          <div className="sv-ct">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h3>Catatan Penting</h3>
          </div>
          <ul className="sv-ul">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Penempatan dana tidak menambah total setoran.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Imbal hasil dicatat sebagai keuntungan dari investasi, bukan setoran.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Dana yang dicairkan bisa dikembalikan ke tabungan atau dialihkan ke instrumen lain.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Nilai dan imbal hasil berasal dari data yang kamu masukkan, bukan nilai pasar terbaru.</span>
            </li>
          </ul>
        </section>
      </div>

      <img className="sv-fl-bottom" src={FL.border} alt="" aria-hidden="true" />
    </div>
  );
}
