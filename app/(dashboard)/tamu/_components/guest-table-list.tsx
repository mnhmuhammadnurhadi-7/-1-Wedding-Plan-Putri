"use client";

import { confOf, sideOf } from "@/components/planner/data/calculations";
import type { Guest, PlannerData } from "@/components/planner/data/types";

interface GuestTableListProps {
  guests: Guest[];
  data: PlannerData;
  onEditGuest: (guest: Guest) => void;
  onAddGuest: () => void;
  onChangePax: (guest: Guest, delta: number) => void;
  onChangeRsvp: (guest: Guest, rsvp: string) => void;
  canWrite: boolean;
}

export function GuestTableList({
  guests,
  data,
  onEditGuest,
  onAddGuest,
  onChangePax,
  onChangeRsvp,
  canWrite,
}: GuestTableListProps) {
  if (!guests.length) {
    return (
      <div className="empty" style={{ padding: "32px 16px" }}>
        <b>Tidak ada tamu</b>
        <p>Ubah filter atau tambahkan tamu undangan.</p>
        {canWrite && (
          <button
            type="button"
            className="btn pri"
            style={{ marginTop: "12px" }}
            onClick={onAddGuest}
          >
            + Tambah tamu
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="card">
      <div className="list">
        {guests.map((g) => {
          const side = sideOf(data, g);
          const sideLabel = side ? `Pihak ${side}` : g.group;
          const conf = confOf(g);
          const pax = Number(g.pax) || 1;
          const waLink = g.wa
            ? `https://wa.me/${g.wa.replace(/[^0-9]/g, "").replace(/^0/, "62")}`
            : "";

          return (
            <div
              key={g.id}
              className="row guest"
              style={{ flexWrap: "wrap" }}
            >
              <div
                className="main click"
                style={{ cursor: "pointer", flex: "1 1 200px" }}
                onClick={() => canWrite && onEditGuest(g)}
              >
                <div className="t">{g.name}</div>
                <div className="m">
                  <span>{sideLabel}</span>
                  {g.table && <span>Meja {g.table}</span>}
                  <span>{g.invited === "Sudah" ? "Terkirim" : "Belum dikirim"}</span>
                  {g.note && <span>{g.note}</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div className="step" title="Jumlah orang dalam undangan">
                  <button
                    type="button"
                    aria-label="Kurangi"
                    disabled={!canWrite || pax <= 1}
                    onClick={() => onChangePax(g, -1)}
                  >
                    −
                  </button>
                  <b className="num">{pax}</b>
                  <button
                    type="button"
                    aria-label="Tambah"
                    disabled={!canWrite}
                    onClick={() => onChangePax(g, 1)}
                  >
                    +
                  </button>
                </div>

                <select
                  className="sel"
                  value={g.rsvp || "Belum"}
                  disabled={!canWrite}
                  aria-label={`RSVP ${g.name}`}
                  onChange={(e) => onChangeRsvp(g, e.target.value)}
                >
                  {["Belum", "Hadir", "Tidak Hadir"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>

                {g.rsvp === "Hadir" && (
                  <span className="pill ok">
                    Hadir {conf}/{pax}
                  </span>
                )}

                {waLink && (
                  <a className="btn sm" href={waLink} target="_blank" rel="noopener noreferrer">
                    WA
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
