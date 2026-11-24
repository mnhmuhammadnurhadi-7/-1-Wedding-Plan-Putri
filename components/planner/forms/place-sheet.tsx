"use client";

import {
  fromRed,
  pStatus,
  redOf,
  remOf,
  yieldOf,
} from "../data/calculations";
import { PST } from "../data/constants";
import {
  dFmt,
  fmt,
  sgn,
  tenor,
} from "../data/helpers";
import { usePlanner } from "../data/planner-store";
import type { PlannerItem } from "../data/types";
import { Pill } from "../ui/pills";
import { Sheet } from "../ui/sheet";

export function PlaceSheet({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const {
    data,
    ui,
    canWrite,
    openForm,
    putItem,
    delItem,
    toast,
    closeSheet,
  } = usePlanner();
  const place = data.invest[id];
  if (!place) return null;

  const status = pStatus(place);
  const redemptions = redOf(place);
  const remaining = remOf(place);
  const parent = fromRed(place) ? data.invest[place.src?.pid || ""] : null;

  const kv = (label: string, value: React.ReactNode) => (
    <div className="kv" key={label}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );

  const undo = (redemptionId: string) => {
    if (!canWrite) return;
    const redemption = redemptions.find((entry) => entry.id === redemptionId);
    if (!redemption) return;
    const nextRedemptions = redemptions.filter(
      (entry) => entry.id !== redemptionId,
    );
    if (ui.tb.undo !== redemptionId) {
      // first tap asks for confirmation
      return;
    }
    if (redemption.dest === "Instrumen" && redemption.destPid) {
      delItem("invest", redemption.destPid);
    }
    putItem("invest", {
      ...place,
      redemptions: nextRedemptions,
      status: remOf({ ...place, redemptions: nextRedemptions } as PlannerItem) > 0
        ? "Berjalan"
        : place.status,
    });
    toast("Pencairan dibatalkan");
    closeSheet();
  };

  return (
    <Sheet onClose={onClose}>
      <h2>{place.name}</h2>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          margin: "-6px 0 12px",
        }}
      >
        <Pill tone={PST[status]}>{status}</Pill>
        <Pill>{place.kind}</Pill>
        <Pill>{place.owner || "Bersama"}</Pill>
      </div>
      {kv("Nominal penempatan", fmt(Number(place.amount) || 0))}
      {redemptions.length
        ? kv(
            "Pokok yang sudah dicairkan",
            fmt((Number(place.amount) || 0) - remaining),
          )
        : null}
      {redemptions.length ? kv("Sisa penempatan", fmt(remaining)) : null}
      {kv("Tanggal penempatan", place.date ? dFmt(place.date) : "-")}
      {kv(
        "Jatuh tempo",
        place.due
          ? `${dFmt(place.due)}${tenor(place.date, place.due) ? ` · ${tenor(place.date, place.due)}` : ""}`
          : "-",
      )}
      {kv("Sumber dana", parent ? `Pencairan ${parent.name}` : "Tabungan")}
      {kv("Imbal hasil", yieldOf(place) ? sgn(yieldOf(place)) : "-")}
      {remaining > 0 && Number(place.gain) ? (
        kv("  termasuk belum dicairkan", sgn(Number(place.gain) || 0))
      ) : null}
      {place.note ? kv("Keterangan", place.note) : null}
      <div className="sec" style={{ margin: "18px 0 8px" }}>
        <h2 style={{ fontSize: 20 }}>Riwayat pencairan</h2>
      </div>
      {redemptions.length ? (
        redemptions.map((redemption) => {
          const destination =
            redemption.dest === "Instrumen"
              ? data.invest[redemption.destPid || ""]?.name ||
                "instrumen lain"
              : redemption.destAcct || "Tabungan";
          return (
            <div
              className="txn"
              style={{ cursor: "default", display: "block" }}
              key={redemption.id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <b>{dFmt(redemption.date)}</b>
                <b className="num">{fmt(Number(redemption.total) || 0)}</b>
              </div>
              <div>
                Pokok {fmt(Number(redemption.principal) || 0)} · imbal hasil{" "}
                {sgn(Number(redemption.yield) || 0)}
              </div>
              <div>
                {redemption.dest === "Instrumen"
                  ? "Dialihkan ke"
                  : "Dikembalikan ke"}{" "}
                <b>{destination}</b>
                {redemption.note ? ` · ${redemption.note}` : ""}
              </div>
              {canWrite ? (
                <div style={{ marginTop: 6 }}>
                  <button
                    className="btn sm bad"
                    type="button"
                    onClick={() => undo(redemption.id)}
                  >
                    {ui.tb.undo === redemption.id
                      ? "Ya, batalkan pencairan ini"
                      : "Batalkan pencairan"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="note">Belum ada pencairan.</div>
      )}
      <div className="acts">
        <button className="btn" type="button" onClick={onClose}>
          Tutup
        </button>
        {canWrite ? (
          <>
            <button
              className="btn"
              type="button"
              onClick={() => openForm("place", place)}
            >
              Ubah
            </button>
            {remaining > 0 ? (
              <button
                className="btn pri"
                type="button"
                onClick={() => openForm("redeem", place)}
              >
                Catat pencairan
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </Sheet>
  );
}
