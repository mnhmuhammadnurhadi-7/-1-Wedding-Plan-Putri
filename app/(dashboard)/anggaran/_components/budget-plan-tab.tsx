"use client";

import { fmt, pct } from "@/components/planner/data/helpers";
import { exSt, paidOf } from "@/components/planner/data/calculations";
import type { BudgetItem, Expense } from "@/components/planner/data/types";

interface BudgetPlanTabProps {
  categories: string[];
  query: string;
  budgetItems: BudgetItem[];
  expenses: Expense[];
  actB: Record<string, number>;
  paidB: Record<string, number>;
  onEditItem: (item: BudgetItem) => void;
  onAddItemInCat: (cat: string) => void;
  onEditCat: (cat: string) => void;
  onAddExpenseFor: (budgetId: string) => void;
  onEditExpense: (expense: Expense) => void;
  onAddCategory: () => void;
  canWrite: boolean;
  getVendorName?: (id?: string) => string;
}

export function BudgetPlanTab({
  categories,
  query,
  budgetItems,
  expenses,
  actB,
  paidB,
  onEditItem,
  onAddItemInCat,
  onEditCat,
  onAddExpenseFor,
  onEditExpense,
  onAddCategory,
  canWrite,
  getVendorName,
}: BudgetPlanTabProps) {
  const q = query.toLowerCase().trim();

  const hit = (item: BudgetItem) => {
    if (!q) return true;
    const transactions = expenses.filter((expense) => expense.budgetId === item.id);
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.cat || "").toLowerCase().includes(q) ||
      (item.note || "").toLowerCase().includes(q) ||
      transactions.some((expense) => {
        const vendorName = getVendorName ? getVendorName(expense.vendorId) : "";
        return [expense.desc, expense.note, vendorName, expense.payer, expense.method]
          .some((value) => (value || "").toLowerCase().includes(q));
      })
    );
  };

  const pc: Record<string, string> = {
    "Belum Dibayar": "warn",
    DP: "acc",
    Lunas: "ok",
  };

  const renderTxn = (e: Expense) => {
    const s = exSt(e);
    const pd = paidOf(e);
    const vn = getVendorName ? getVendorName(e.vendorId) : "";
    const dateStr = e.date
      ? new Date(`${e.date}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
      : "";

    return (
      <div
        key={e.id}
        className="txn"
        onClick={() => canWrite && onEditExpense(e)}
        role="button"
        tabIndex={0}
      >
        <span>
          {dateStr} · {e.desc}
          {vn ? ` · ${vn}` : ""}
          {s === "DP" ? ` · dibayar ${fmt(pd)}` : ""}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>
          <span className={`pill ${pc[s] || ""}`}>{s}</span>{" "}
          <b className="num">{fmt(Number(e.amount) || 0)}</b>
        </span>
      </div>
    );
  };

  const catSections = categories.map((cat) => {
    const all = budgetItems.filter((b) => b.cat === cat);
    const xs = all.filter(hit);
    if (q && !xs.length) return null;

    const t = all.reduce((sum, b) => sum + (Number(b.qty) || 1) * (Number(b.price) || 0), 0);
    const a = all.reduce((sum, b) => sum + (actB[b.id] || 0), 0);
    const over = a > t && t > 0;
    const d = t - a;

    return (
      <section key={cat} className="card" style={{ marginBottom: "14px" }}>
        <div className="cathead">
          <div>
            <h3>{cat}</h3>
            <div className="note num">
              Estimasi {fmt(t)} · Realisasi {fmt(a)} ·{" "}
              {over ? (
                <b style={{ color: "var(--bad)" }}>Melebihi {fmt(-d)}</b>
              ) : (
                `Sisa ${fmt(d)}`
              )}
            </div>
          </div>
          {canWrite && (
            <div className="bt">
              <button
                type="button"
                className="btn sm"
                onClick={() => onEditCat(cat)}
              >
                Ubah kategori
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => onAddItemInCat(cat)}
              >
                + Item
              </button>
            </div>
          )}
        </div>
        <div
          className={`bar thin ${over ? "bad" : ""}`}
          style={{ margin: "0 4px 6px" }}
        >
          <i style={{ width: `${pct(a, t)}%` }} />
        </div>
        <div className="list">
          {xs.length ? (
            xs.map((b) => {
              const act = actB[b.id] || 0;
              const tot = (Number(b.qty) || 1) * (Number(b.price) || 0);
              const paid = paidB[b.id] || 0;
              const tx = expenses
                .filter((e) => e.budgetId === b.id)
                .sort((p, q) => (q.date || "").localeCompare(p.date || ""));

              let pill: React.ReactNode;
              if (act === 0) {
                pill = <span className="pill">Belum ada realisasi</span>;
              } else if (act > tot && tot > 0) {
                pill = <span className="pill bad">Melebihi estimasi {fmt(act - tot)}</span>;
              } else if (act === tot) {
                pill = <span className="pill ok">Pas</span>;
              } else {
                pill = <span className="pill ok">Sisa {fmt(tot - act)}</span>;
              }

              return (
                <div key={b.id} className="item">
                  <div className="row">
                    <div className="main">
                      <div className="t">{b.name}</div>
                      <div className="m">
                        {pill}
                        {act > paid && (
                          <span className="pill warn">Tagihan {fmt(act - paid)}</span>
                        )}
                        {(Number(b.qty) || 1) > 1 && (
                          <span className="num">
                            {b.qty} × {fmt(Number(b.price) || 0)}
                          </span>
                        )}
                        {b.note && <span>{b.note}</span>}
                      </div>
                    </div>
                    <div className="cmp">
                      <div>
                        <small>Estimasi</small>
                        <b className="num">{fmt(tot)}</b>
                      </div>
                      <div>
                        <small>Realisasi</small>
                        <b className="num">{fmt(act)}</b>
                      </div>
                    </div>
                    {canWrite && (
                      <div className="bt">
                        <button
                          type="button"
                          className="btn sm pri"
                          onClick={() => onAddExpenseFor(b.id)}
                        >
                          Catat bayar
                        </button>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => onEditItem(b)}
                        >
                          Ubah
                        </button>
                      </div>
                    )}
                  </div>
                  {tx.map(renderTxn)}
                </div>
              );
            })
          ) : (
            <div className="empty" style={{ padding: "18px 8px" }}>
              Belum ada item di kategori ini.
            </div>
          )}
        </div>
      </section>
    );
  });

  const orphan = expenses.filter(
    (e) =>
      !budgetItems.some((b) => b.id === e.budgetId) &&
      (!q ||
        (e.desc || "").toLowerCase().includes(q) ||
        (e.note || "").toLowerCase().includes(q))
  );
  const renderedAnyCategory = catSections.some(Boolean);

  return (
    <>
      {catSections}

      {!renderedAnyCategory && (
        <div className="empty" style={{ padding: "32px 16px" }}>
          <b>Belum ada estimasi</b>
          <p>Mulai dengan membuat kategori, lalu tambahkan item beserta estimasi harganya.</p>
          {canWrite && (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
              <button type="button" className="btn pri" onClick={onAddCategory}>
                Buat kategori
              </button>
            </div>
          )}
        </div>
      )}

      {orphan.length > 0 && (
        <section className="card" style={{ marginBottom: "14px" }}>
          <div className="cathead">
            <div>
              <h3>Realisasi tanpa item</h3>
              <div className="note">
                Belum dikaitkan ke item estimasi, jadi belum masuk perbandingan. Buka, lalu pilih item estimasinya.
              </div>
            </div>
          </div>
          {orphan.map(renderTxn)}
        </section>
      )}
    </>
  );
}
