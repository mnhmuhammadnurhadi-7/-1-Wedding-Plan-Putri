"use client";

import Link from "next/link";
import { fmt, pct, short } from "@/components/planner/data/helpers";
import { BNFL, BN_CLR, INSTR_COL } from "@/components/planner/data/assets";
import { BnDonut } from "@/components/planner/ui/bn-donut";
import { allocRows, nameA, nameB, stOf } from "@/components/planner/data/calculations";
import type { Calculation } from "@/components/planner/data/calculations";
import type { PlannerData } from "@/components/planner/data/types";

interface ExecutiveStatsProps {
  data: PlannerData;
  calc: Calculation;
  fund: {
    net: number;
    avail: number;
    invested: number;
    byKind: Record<string, number>;
    unreal: number;
  };
  target: number;
  canWrite: boolean;
  onOpenTarget?: () => void;
}

export function ExecutiveStats({
  data,
  calc: c,
  fund: fd,
  target,
  canWrite,
  onOpenTarget,
}: ExecutiveStatsProps) {
  // Alokasi Dana Tabungan
  const alloc: Array<[string, string, number]> = [
    ["Tabungan", INSTR_COL["Tabungan"], fd.byKind["Tabungan"] || 0],
    ["Deposito", INSTR_COL["Deposito"], fd.byKind["Deposito"] || 0],
    ["Obligasi / SBN", INSTR_COL["Obligasi / SBN"], fd.byKind["Obligasi / SBN"] || 0],
    ["Reksa Dana", INSTR_COL["Reksa Dana"], fd.byKind["Reksa Dana"] || 0],
    ["Imbal Hasil", "var(--c2)", fd.unreal || 0],
  ];

  ["Saham / ETF", "Lainnya"].forEach((k) => {
    if ((fd.byKind[k] || 0) > 0) {
      alloc.push([k, INSTR_COL[k], fd.byKind[k] || 0]);
    }
  });

  const aShow = alloc.map((a) => ({ k: a[0], col: a[1], v: Math.max(0, a[2] || 0) }));
  const aTot = aShow.reduce((s, a) => s + a.v, 0);
  const svPct = target > 0 ? Math.round((fd.net / target) * 100) : 0;

  // Estimasi
  const realPct = c.plan > 0 ? Math.round((c.actual / c.plan) * 100) : 0;

  // Checklist
  const cl = Object.values(data.checklist || {});
  const clPct = pct(c.clDone, c.clAll);

  const groom = nameA(data);
  const bride = nameB(data);

  const uIc = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" width="16" height="16">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );

  const qIc = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" width="16" height="16">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
    </svg>
  );

  const picKey = (pic?: string) =>
    pic === bride ? 0 : pic === groom ? 1 : pic === "Bersama" ? 2 : 3;

  const picT = [
    { v: bride, name: bride, cls: "rose", ico: uIc },
    { v: groom, name: groom, cls: "sage", ico: uIc },
    {
      v: "Bersama",
      name: "Bersama",
      cls: "butter",
      ico: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    { v: "-", name: "Belum ditentukan", cls: "lav", ico: qIc },
  ].map((p, k) => {
    const xs = cl.filter((t) => picKey(t.pic) === k);
    return {
      ...p,
      tot: xs.length,
      done: xs.filter((t) => stOf(t) === "Selesai").length,
    };
  });

  // Dokumen
  const docs = Object.values(data.docs || {});
  const ada = docs.filter((x) => x.have).length;

  // Kategori Estimasi vs Realisasi
  const rows = allocRows(data, c);
  const catRows = rows.filter((r) => r.est > 0 || r.act > 0);
  const catSeg = catRows.map((r, i) => ({ v: r.act, col: BN_CLR[i % 8], name: r.cat }));
  const catTotalAct = catSeg.reduce((s, x) => s + x.v, 0);

  const bnArrow = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );

  return (
    <>
      <section className="bn-main">
        {/* Savings Card */}
        <section className="bn-card bn-sv">
          <div className="bn-in">
            <img className="bn-fl bn-f-bl" src={BNFL.blossom} alt="" aria-hidden="true" />
            <div className="bn-ch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <circle cx="8" cy="8" r="6" /><path d="M18 10a6 6 0 0 0-6-6M8 14a6 6 0 0 0 6 6M16 16a6 6 0 0 0 6-6" />
              </svg>
              <h2>
                <Link href="/tabungan">Savings Dana Nikah</Link>
              </h2>
              <span className="pill acc">{svPct}%</span>
            </div>
            <div className="bn-big">
              <Link href="/tabungan">{fmt(fd.net)}</Link>
            </div>
            <div className="bn-sub">
              {target ? `Target: ${fmt(target)}` : "Target dana nikah belum diatur"}
              {canWrite && (
                <>
                  {" · "}
                  <button className="lk bn-lkb" onClick={onOpenTarget} type="button">
                    {target ? "Ubah" : "Atur"}
                  </button>
                </>
              )}
            </div>
            <div className="bar bn-bar">
              <i style={{ width: `${pct(fd.net, target)}%` }} />
            </div>
            <h3 className="bn-h3">Alokasi Dana Saat Ini</h3>
            <div className="bn-alloc">
              <BnDonut
                segs={aShow.map((a) => ({ v: a.v, col: a.col }))}
                tot={aTot}
                c1={aTot >= 1e8 ? "Rp" + short(aTot) : fmt(aTot)}
                c2="Total Dana"
                label="Alokasi dana saat ini"
              />
              <div className="bn-leg">
                {aShow.map((a, idx) => (
                  <Link key={idx} className="bn-li" href="/tabungan">
                    <span className="bn-dot" style={{ background: a.col }} />
                    <span className="bn-ln">{a.k}</span>
                    <span className="bn-lp">{pct(a.v, aTot)}%</span>
                    <span className="bn-la">{fmt(a.v)}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bn-tot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Total Alokasi Dana</span>
              <b>{fmt(aTot)}</b>
            </div>
          </div>
        </section>

        {/* Estimasi Pengeluaran Card */}
        <section className="bn-card bn-es">
          <div className="bn-in">
            <div className="bn-ch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
              <h2>
                <Link href="/anggaran">Estimasi Pengeluaran</Link>
              </h2>
              <span className="pill warn">{realPct}%</span>
            </div>
            <div className="bn-big">
              <Link href="/anggaran">{fmt(c.plan)}</Link>
            </div>
            <div className="bn-sub">Total estimasi anggaran</div>
            <div className="bn-two">
              <div className="bn-mini">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <circle cx="8" cy="8" r="6" />
                  </svg>
                  Realisasi
                </span>
                <b>
                  <Link href="/anggaran">{fmt(c.actual)}</Link>
                </b>
              </div>
              <div className="bn-mini">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                  </svg>
                  {c.sisa < 0 ? "Melebihi" : "Sisa anggaran"}
                </span>
                <b style={{ color: c.sisa < 0 ? "var(--bad)" : undefined }}>
                  <Link href="/anggaran">{fmt(Math.abs(c.sisa))}</Link>
                </b>
              </div>
            </div>
            <div className={`bar bn-bar ${c.actual > c.plan ? "bad" : "warn"}`}>
              <i style={{ width: `${pct(c.actual, c.plan)}%` }} />
            </div>
            <div className="bn-note">
              {c.plan > 0
                ? `${realPct}% anggaran sudah terealisasi`
                : "Belum ada estimasi pengeluaran"}
            </div>
          </div>
        </section>

        {/* Progress Checklist Card */}
        <section className="bn-card bn-pr">
          <div className="bn-in">
            <img className="bn-fl bn-f-lav" src={BNFL.lav} alt="" aria-hidden="true" />
            <div className="bn-ch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
              </svg>
              <h2>
                <Link href="/checklist">Progress Persiapan</Link>
              </h2>
            </div>
            <div className="bn-big">{clPct}%</div>
            <div className="bn-sub">
              {c.clDone} dari {c.clAll} tugas selesai
            </div>
            <div className="bar bn-bar ok">
              <i style={{ width: `${clPct}%` }} />
            </div>
            <div className="bn-st3">
              {picT.map((p, idx) => (
                <Link key={idx} className={`bn-s3 ${p.cls}`} href="/checklist">
                  <span className="bn-s3h">
                    {p.ico}
                    <em>{p.name}</em>
                  </span>
                  <b>
                    {p.done} / {p.tot}
                  </b>
                  <span className="bn-s3l">Tugas selesai</span>
                </Link>
              ))}
            </div>
            <Link className="bn-lnk" href="/checklist">
              Lihat Checklist {bnArrow}
            </Link>
            <svg className="bn-clip" viewBox="0 0 64 80" aria-hidden="true">
              <rect x="8" y="10" width="48" height="66" rx="7" fill="#fff" stroke="#C9D3B3" strokeWidth="2" />
              <rect x="22" y="4" width="20" height="12" rx="4" fill="#E7EBD9" stroke="#8EA573" strokeWidth="2" />
              <g fill="none" stroke="#8EA573" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 30 4 4 7-8M16 46l4 4 7-8M16 62l4 4 7-8" />
              </g>
              <g stroke="#D9E0C6" strokeWidth="3" strokeLinecap="round">
                <path d="M33 30h16M33 46h16M33 62h16" />
              </g>
            </svg>
          </div>
        </section>

        {/* Mahar & Seserahan Card */}
        <section className="bn-card bn-mh2">
          <div className="bn-in">
            <img className="bn-fl bn-f-cl" src={BNFL.cluster} alt="" aria-hidden="true" />
            <div className="bn-ch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              <h2>Mahar &amp; Seserahan</h2>
              <Link className="bn-go" href="/mahar-seserahan" aria-label="Buka Mahar dan Seserahan">
                {bnArrow}
              </Link>
            </div>
            <div className="bn-big">
              {c.gBought} / {c.gifts.length}
            </div>
          </div>
        </section>

        {/* Dokumen Card */}
        <section className="bn-card bn-dk">
          <div className="bn-in">
            <div className="bn-ch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <h2>Dokumen</h2>
              <Link className="bn-go" href="/dokumen" aria-label="Buka Dokumen">
                {bnArrow}
              </Link>
            </div>
            <div className="bn-big">
              {ada} / {docs.length}
            </div>
          </div>
        </section>
      </section>

      {/* Estimasi vs Realisasi per Kategori */}
      <section className="bn-card bn-cat">
        <div className="bn-in">
          <div className="bn-ch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <h2>Estimasi vs Realisasi per Kategori</h2>
            <Link className="btn sm bn-detail" href="/anggaran">
              Lihat detail {bnArrow}
            </Link>
          </div>
          {catRows.length ? (
            <div className="bn-cg">
              <div className="bn-cl">
                <BnDonut
                  segs={catSeg.map((a) => ({ v: a.v, col: a.col }))}
                  tot={catTotalAct}
                  c1={`${realPct}%`}
                  c2="Terealisasi"
                  label="Total realisasi per kategori"
                />
                <div className="bn-leg">
                  {catSeg.map((a, i) => (
                    <div key={i} className="bn-li">
                      <span className="bn-dot" style={{ background: a.col }} />
                      <span className="bn-ln">{a.name}</span>
                      <span className="bn-lp">{pct(a.v, catTotalAct)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bn-cb">
                {catRows.map((x, i) => {
                  const over = x.act > x.est;
                  return (
                    <div key={i} className="bn-cr">
                      <div className="bn-crh">
                        <span className="bn-crn">
                          <i style={{ background: BN_CLR[i % 8] }} />
                          {x.cat}
                        </span>
                        <span className="bn-cra">
                          {fmt(x.act)} / {fmt(x.est)}
                          {over && <b> OVER</b>}
                        </span>
                      </div>
                      <div className={`bar thin ${over ? "bad" : ""}`}>
                        <i
                          style={{
                            width: `${pct(x.act, x.est)}%`,
                            background: over ? undefined : BN_CLR[i % 8],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty">
              Belum ada pos estimasi atau realisasi.
              <br />
              <Link href="/anggaran">Buka Estimasi Pengeluaran →</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
