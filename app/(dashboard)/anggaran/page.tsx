"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { catNames } from "@/components/planner/data/calculations";
import type { BudgetItem, Expense } from "@/components/planner/data/types";
import { BudgetSummaryCards } from "./_components/budget-summary-cards";
import { BudgetFilters } from "./_components/budget-filters";
import { BudgetPlanTab } from "./_components/budget-plan-tab";
import { BudgetHistoryTab } from "./_components/budget-history-tab";

export default function AnggaranPage() {
  const { data, calc, ui, setFilter, canWrite, openForm } = usePlanner();

  const filter = ui.ag;
  const cats = catNames(data);
  const activeTab = (filter.tab === "riwayat" ? "riwayat" : "banding") as "banding" | "riwayat";
  const diff = calc.plan - calc.actual;

  const getBudgetName = (id?: string) => {
    const item = calc.budget.find((entry) => entry.id === id);
    return item ? `${item.cat || ""} · ${item.name || ""}` : "Tanpa item";
  };

  const getVendorName = (id?: string) => {
    const vendor = calc.ven.find((entry) => entry.id === id);
    return vendor?.name || "";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="head">
        <div>
          <h1>Estimasi Pengeluaran</h1>
          <p>
            Bandingkan rencana biaya (estimasi) dengan uang yang benar-benar keluar (realisasi)
          </p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn"
              onClick={() => openForm("cat")}
            >
              Kategori
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => openForm("list")}
            >
              Tambah banyak item
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => openForm("budget")}
            >
              Item estimasi
            </button>
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("expense")}
            >
              Catat realisasi
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Cards */}
      <BudgetSummaryCards
        plan={calc.plan}
        actual={calc.actual}
        paid={calc.paid}
        bill={calc.bill}
        diff={diff}
        catCount={cats.length}
        itemCount={calc.budget.length}
      />

      {/* Cara memakai halaman ini */}
      <details
        className="card soft"
        style={{ marginBottom: "16px" }}
        open={calc.budget.length === 0}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          Cara memakai halaman ini
        </summary>
        <ol style={{ margin: "10px 0 0", paddingLeft: "20px", lineHeight: "1.7" }}>
          <li>
            <b>Estimasi</b> = rencana biaya. Buat kategori (mis. Catering), lalu tambahkan item beserta perkiraan harganya. Banyak item sekaligus? Pakai <i>Tambah banyak item</i>.
          </li>
          <li>
            <b>Realisasi</b> = uang yang benar-benar keluar. Setelah membayar atau menerima tagihan, tekan <i>Catat bayar</i> pada item itu. Pilih status Belum Dibayar, DP, atau Lunas.
          </li>
          <li>
            Halaman ini otomatis membandingkan estimasi dan realisasi tiap item dan tiap kategori. Tulisan <b>Melebihi estimasi</b> muncul kalau realisasi lebih besar.
          </li>
        </ol>
      </details>

      {/* Segment Tabs + Search */}
      <BudgetFilters
        activeTab={activeTab}
        onTabChange={(tab) => setFilter("ag", "tab", tab)}
        query={filter.q || ""}
        onQueryChange={(q) => setFilter("ag", "q", q)}
      />

      {/* Tab content */}
      {activeTab === "banding" ? (
        <BudgetPlanTab
          categories={cats}
          query={filter.q || ""}
          budgetItems={calc.budget}
          expenses={calc.exp}
          actB={calc.actB}
          paidB={calc.paidB}
          onEditItem={(item: BudgetItem) => openForm("budget", item)}
          onAddItemInCat={(cat: string) => openForm("budget", { id: "", cat } as any)}
          onEditCat={(cat: string) => openForm("cat", { id: "", name: cat } as any)}
          onAddExpenseFor={(budgetId: string) => openForm("expense", { id: "", budgetId } as any)}
          onEditExpense={(item: Expense) => openForm("expense", item)}
          onAddCategory={() => openForm("cat")}
          canWrite={canWrite}
          getVendorName={getVendorName}
        />
      ) : (
        <BudgetHistoryTab
          expenses={calc.exp}
          onEditExpense={(item: Expense) => openForm("expense", item)}
          onAddExpense={() => openForm("expense")}
          canWrite={canWrite}
          getBudgetName={getBudgetName}
          getVendorName={getVendorName}
          query={filter.q || ""}
          statusFilter={filter.st || "Semua"}
          onStatusFilterChange={(st) => setFilter("ag", "st", st)}
        />
      )}
    </div>
  );
}
