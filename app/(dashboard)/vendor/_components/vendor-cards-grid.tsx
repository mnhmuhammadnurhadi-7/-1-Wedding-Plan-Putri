"use client";

import { fmt, pct } from "@/components/planner/data/helpers";
import { vDp, vStatus } from "@/components/planner/data/calculations";
import type { Vendor } from "@/components/planner/data/types";

interface VendorCardsGridProps {
  vendors: Vendor[];
  onEditVendor: (vendor: Vendor) => void;
  onAddVendor: () => void;
  canWrite: boolean;
  getPaidAmount: (id: string) => number;
}

export function VendorCardsGrid({
  vendors,
  onEditVendor,
  onAddVendor,
  canWrite,
  getPaidAmount,
}: VendorCardsGridProps) {
  if (!vendors.length) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <b>Tidak ada vendor</b>
        <p>Tambahkan vendor pertama.</p>
        {canWrite && (
          <button
            type="button"
            className="btn pri"
            style={{ marginTop: "12px" }}
            onClick={onAddVendor}
          >
            + Tambah vendor
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid g2">
      {vendors.map((v) => {
        const p = getPaidAmount(v.id);
        const dp = vDp(v);
        const vs = vStatus(v, p);
        const price = Number(v.price) || 0;
        const remaining = Math.max(0, price - p);
        const paidPct = pct(p, price);

        const pillCls =
          vs === "Lunas"
            ? "ok"
            : vs === "Booked"
            ? "acc"
            : vs === "Negosiasi"
            ? "warn"
            : vs === "Batal"
            ? "bad"
            : "";

        const waLink = v.phone
          ? `https://wa.me/${v.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`
          : "";

        return (
          <article key={v.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div className="eyebrow">{v.cat}</div>
                <h3 style={{ fontSize: "25px", marginTop: "2px" }}>{v.name}</h3>
              </div>
              <span className={`pill ${pillCls}`}>{vs}</span>
            </div>

            {v.pkg && <div className="sub">{v.pkg}</div>}

            <div
              className="grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}
            >
              {v.quote && (
                <div className="stat">
                  <small>Harga penawaran</small>
                  <b>{fmt(Number(v.quote))}</b>
                </div>
              )}
              <div className="stat">
                <small>Harga kesepakatan</small>
                <b>{fmt(price)}</b>
              </div>
              <div className="stat">
                <small>DP disepakati</small>
                <b>{dp ? fmt(dp) : "–"}</b>
              </div>
              <div className="stat">
                <small>Sudah dibayar</small>
                <b>{fmt(p)}</b>
              </div>
              <div className="stat">
                <small>Sisa pembayaran</small>
                <b>{fmt(remaining)}</b>
              </div>
            </div>

            <div className={`bar ${p > price ? "bad" : p >= price && price > 0 ? "ok" : ""}`} style={{ marginTop: "10px" }}>
              <i style={{ width: `${paidPct}%` }} />
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }}>
              {dp > p && (
                <span className="pill warn">DP kurang {fmt(dp - p)}</span>
              )}
              {v.payDue && (
                <>
                  <span className="note">Pelunasan:</span>
                  <span className="pill">
                    {new Date(`${v.payDue}T00:00:00`).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </>
              )}
            </div>

            <div className="note" style={{ display: "flex", gap: "4px 14px", flexWrap: "wrap", marginTop: "12px" }}>
              {v.pic && <span>{v.pic}</span>}
              {v.phone && <span className="num">{v.phone}</span>}
              {v.due && (
                <span>
                  Acara:{" "}
                  {new Date(`${v.due}T00:00:00`).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
              <span>Kontrak: {v.contract || "Belum"}</span>
            </div>

            {v.note && <div className="note" style={{ marginTop: "6px" }}>{v.note}</div>}

            <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
              {v.phone && (
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => navigator.clipboard.writeText(v.phone || "")}
                >
                  Salin nomor
                </button>
              )}
              {waLink && (
                <a className="btn sm" href={waLink} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
              {canWrite && (
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => onEditVendor(v)}
                >
                  Ubah
                </button>
              )}
              {v.refUrl && (
                <a className="btn sm" href={v.refUrl} target="_blank" rel="noopener noreferrer">
                  Referensi
                </a>
              )}
              {v.contractUrl && (
                <a className="btn sm" href={v.contractUrl} target="_blank" rel="noopener noreferrer">
                  Kontrak
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
