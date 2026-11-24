"use client";

import { fmt } from "@/components/planner/data/helpers";
import { exSt, paidOf } from "@/components/planner/data/calculations";
import type { Expense } from "@/components/planner/data/types";

interface BudgetHistoryTabProps {
  expenses: Expense[];
  onEditExpense: (item: Expense) => void;
  onAddExpense: () => void;
  canWrite: boolean;
  getBudgetName: (id?: string) => string;
  getVendorName: (id?: string) => string;
  query?: string;
  statusFilter?: string;
  onStatusFilterChange?: (st: string) => void;
}

const EXST = ["Belum Dibayar", "DP", "Lunas"];

export function BudgetHistoryTab({
  expenses,
  onEditExpense,
  onAddExpense,
  canWrite,
  getBudgetName,
  getVendorName,
  query = "",
  statusFilter = "Semua",
  onStatusFilterChange,
}: BudgetHistoryTabProps) {
  const q = query.toLowerCase().trim();

  const filtered = expenses.filter((e) => {
    const s = exSt(e);
    if (statusFilter !== "Semua" && s !== statusFilter) return false;
    if (!q) return true;
    const bName = getBudgetName(e.budgetId);
    const vName = getVendorName(e.vendorId);
    return (
      (e.desc || "").toLowerCase().includes(q) ||
      bName.toLowerCase().includes(q) ||
      vName.toLowerCase().includes(q) ||
      (e.payer || "").toLowerCase().includes(q) ||
      (e.note || "").toLowerCase().includes(q)
    );
  });

  const months: Record<string, Expense[]> = {};
  [...filtered]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .forEach((e) => {
      const k = (e.date || "").slice(0, 7);
      (months[k] = months[k] || []).push(e);
    });

  const monthKeys = Object.keys(months);

  const pc: Record<string, string> = {
    "Belum Dibayar": "warn",
    DP: "acc",
    Lunas: "ok",
  };

  return (
    <>
      <div className="chips">
        {["Semua", ...EXST].map((v) => {
          const count =
            v === "Semua"
              ? expenses.length
              : expenses.filter((e) => exSt(e) === v).length;
          return (
            <button
              key={v}
              type="button"
              className="chip"
              aria-pressed={statusFilter === v}
              onClick={() => onStatusFilterChange?.(v)}
            >
              {v}
              <em>{count}</em>
            </button>
          );
        })}
      </div>

      {monthKeys.length > 0 ? (
        monthKeys.map((k) => {
          const xs = months[k];
          const monthTotal = xs.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const monthTitle = k
            ? new Date(`${k}-01T00:00:00`).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })
            : "Tanpa tanggal";

          return (
            <section key={k} className="card" style={{ marginBottom: "14px" }}>
              <div className="grp" style={{ cursor: "default" }}>
                <h3>{monthTitle}</h3>
                <small className="num">{fmt(monthTotal)}</small>
              </div>
              <div className="list">
                {xs.map((e) => {
                  const s = exSt(e);
                  const pd = paidOf(e);
                  const bName = getBudgetName(e.budgetId);
                  const vName = getVendorName(e.vendorId);
                  const dateStr = e.date
                    ? new Date(`${e.date}T00:00:00`).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "";

                  return (
                    <div
                      key={e.id}
                      className="row click"
                      onClick={() => canWrite && onEditExpense(e)}
                    >
                      <div className="main">
                        <div className="t">{e.desc}</div>
                        <div className="m">
                          <span>{dateStr}</span>
                          <span>{bName}</span>
                          {vName ? <span>{vName}</span> : null}
                          {e.payer || e.method ? (
                            <span>
                              {[e.payer, e.method].filter(Boolean).join(" · ")}
                            </span>
                          ) : null}
                          {s === "DP" && (
                            <span>
                              Dibayar {fmt(pd)} · sisa{" "}
                              {fmt((Number(e.amount) || 0) - pd)}
                            </span>
                          )}
                          {e.proof && (
                            <a
                              className="lk"
                              href={e.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              Bukti
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="amt num">{fmt(Number(e.amount) || 0)}</div>
                        <span className={`pill ${pc[s] || ""}`}>{s}</span>
                      </div>
                      {canWrite && (
                        <button
                          type="button"
                          className="btn sm"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEditExpense(e);
                          }}
                        >
                          Ubah
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <div className="empty" style={{ padding: "32px 16px" }}>
          <b>Belum ada realisasi</b>
          <p>Catat pembayaran atau tagihan pertama.</p>
          {canWrite && (
            <button
              type="button"
              className="btn pri"
              style={{ marginTop: "12px" }}
              onClick={onAddExpense}
            >
              Catat realisasi
            </button>
          )}
        </div>
      )}
    </>
  );
}
