"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { vStatus } from "@/components/planner/data/calculations";
import type { Vendor } from "@/components/planner/data/types";
import { VendorSummaryCards } from "./_components/vendor-summary-cards";
import { VendorFilters } from "./_components/vendor-filters";
import { VendorCardsGrid } from "./_components/vendor-cards-grid";

export default function VendorPage() {
  const { data, calc, ui, setFilter, canWrite, openForm } = usePlanner();

  const q = (ui.vd.q || "").toLowerCase().trim();
  const vendorList: Vendor[] = Object.values(data.vendors || {});
  const categories = Array.from(new Set(vendorList.map((v) => v.cat).filter(Boolean))) as string[];
  const statuses = ["Calon", "Negosiasi", "Booked", "Lunas", "Batal"];

  const getPaidAmount = (id: string) => {
    return calc.paidV[id] || 0;
  };

  const filteredVendors = vendorList.filter((v) => {
    if (ui.vd.cat && ui.vd.cat !== "Semua" && v.cat !== ui.vd.cat) return false;
    if (ui.vd.st && ui.vd.st !== "Semua" && vStatus(v, getPaidAmount(v.id)) !== ui.vd.st) return false;
    if (!q) return true;
    return (
      (v.name || "").toLowerCase().includes(q) ||
      (v.cat || "").toLowerCase().includes(q) ||
      (v.pic || "").toLowerCase().includes(q) ||
      (v.pkg || "").toLowerCase().includes(q) ||
      (v.note || "").toLowerCase().includes(q)
    );
  });

  const totalCost = vendorList.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalPaid = vendorList.reduce((acc, curr) => acc + getPaidAmount(curr.id), 0);

  const bookedCount = vendorList.filter(
    (v) => vStatus(v, getPaidAmount(v.id)) === "Booked"
  ).length;
  const lunasCount = vendorList.filter(
    (v) => vStatus(v, getPaidAmount(v.id)) === "Lunas"
  ).length;

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Vendor</h1>
          <p>Penawaran, kesepakatan, dan pembayaran</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("vendor")}
            >
              Tambah vendor
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary cards */}
      <VendorSummaryCards
        totalCount={vendorList.length}
        totalCost={totalCost}
        totalPaid={totalPaid}
        bookedCount={bookedCount}
        lunasCount={lunasCount}
      />

      {/* Filter */}
      <VendorFilters
        query={ui.vd.q || ""}
        onQueryChange={(qVal) => setFilter("vd", "q", qVal)}
        categories={categories}
        activeCategory={ui.vd.cat || "Semua"}
        onCategoryChange={(value) => setFilter("vd", "cat", value)}
        statuses={statuses}
        activeStatus={ui.vd.st || "Semua"}
        onStatusChange={(value) => setFilter("vd", "st", value)}
      />

      {/* Grid of vendors */}
      <VendorCardsGrid
        vendors={filteredVendors}
        onEditVendor={(vendor: Vendor) => openForm("vendor", vendor)}
        onAddVendor={() => openForm("vendor")}
        canWrite={canWrite}
        getPaidAmount={getPaidAmount}
      />
    </div>
  );
}
