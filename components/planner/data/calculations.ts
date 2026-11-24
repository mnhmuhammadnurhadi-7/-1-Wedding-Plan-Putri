import { EVMAP, INSTR } from "./constants";
import {
  fmt,
  sorted,
  sum,
  todayISO,
} from "./helpers";
import type {
  BudgetItem,
  Category,
  CollectionKey,
  Expense,
  Gift,
  Guest,
  Investment,
  PlannerData,
  PlannerItem,
  Redemption,
  Task,
  Vendor,
} from "./types";

export const nameA = (data: PlannerData) => data.settings.a || "Antariksa";
export const nameB = (data: PlannerData) => data.settings.b || "Sofiya";

export const tabLabel = (data: PlannerData, who?: string) =>
  who === nameB(data)
    ? data.settings.tabB || "Tabungan Putri Sofiyani (Sofiya)"
    : data.settings.tabA || "Tabungan Antariksa (Izza)";

export const listOf = <K extends CollectionKey>(
  data: PlannerData,
  key: K,
): PlannerData[K][string][] =>
  sorted(Object.values(data[key]) as PlannerData[K][string][]);

export const byId = <K extends CollectionKey>(
  data: PlannerData,
  key: K,
  id?: string,
) => (id ? (data[key][id] as PlannerData[K][string] | undefined) : undefined);

export const stOf = (task: Task) =>
  task.status || (task.done ? "Selesai" : "Belum Dimulai");

export const evOf = (task: Task) =>
  task.event || EVMAP[task.cat || ""] || "Umum";

export const sideOf = (data: PlannerData, guest: Guest) =>
  guest.side ||
  (/sofiya/i.test(guest.group || "")
    ? nameB(data)
    : /antariksa/i.test(guest.group || "")
      ? nameA(data)
      : "");

export const confOf = (guest: Guest) =>
  guest.rsvp === "Hadir"
    ? guest.confirmed != null && guest.confirmed !== ""
      ? Number(guest.confirmed)
      : Number(guest.pax) || 0
    : 0;

export const noteType = (note: PlannerItem) => {
  const text = String(note.type || "");
  if (text) return text;
  if (/^ide\b/i.test(String(note.note || ""))) return "Ide";
  if (note.status === "Selesai") return "Keputusan";
  return "Perlu Dibahas";
};

export const exSt = (expense: Expense) =>
  expense.status === "Belum Dibayar"
    ? "Belum Dibayar"
    : expense.status === "DP"
      ? "DP"
      : "Lunas";

export const paidOf = (expense: Expense) => {
  const amount = Number(expense.amount) || 0;
  const status = exSt(expense);
  if (status === "Belum Dibayar") return 0;
  if (status === "DP")
    return Math.min(Math.max(Number(expense.paid) || 0, 0), amount);
  return amount;
};

export const vDp = (vendor: Vendor) =>
  vendor.dp != null && vendor.dp !== ""
    ? Number(vendor.dp)
    : Number(vendor.legacyDp) || 0;

export const vStatus = (vendor: Vendor, paid: number) => {
  if (vendor.vstatus) return vendor.vstatus;
  const price = Number(vendor.price) || 0;
  if (price > 0 && paid >= price) return "Lunas";
  if (paid > 0) return "Booked";
  return "Calon";
};

export const catNames = (data: PlannerData) => [
  ...new Set(
    [
      ...listOf(data, "cats").map((item) => String(item.name || "")),
      ...listOf(data, "budget").map((item) => String(item.cat || "")),
    ].filter(Boolean),
  ),
];

export const bt = (item: BudgetItem) =>
  (Number(item.qty) || 1) * (Number(item.price) || 0);

export function calculate(data: PlannerData) {
  const budget = listOf(data, "budget");
  const exp = listOf(data, "expenses");
  const ven = listOf(data, "vendors");
  const gs = listOf(data, "guests");
  const gifts = listOf(data, "gifts");
  const cl = listOf(data, "checklist");

  const paidB: Record<string, number> = {};
  const actB: Record<string, number> = {};
  const paidV: Record<string, number> = {};

  exp.forEach((item) => {
    const amount = Number(item.amount) || 0;
    if (item.budgetId) {
      actB[item.budgetId] = (actB[item.budgetId] || 0) + amount;
      paidB[item.budgetId] = (paidB[item.budgetId] || 0) + paidOf(item);
    }
    if (item.vendorId) {
      paidV[item.vendorId] = (paidV[item.vendorId] || 0) + paidOf(item);
    }
  });

  const bIds = new Set(budget.map((item) => item.id));
  const linked = (gift: Gift) =>
    Boolean(gift.budgetId && bIds.has(gift.budgetId));
  const gAct = (gift: Gift) =>
    gift.budgetId && linked(gift)
      ? actB[gift.budgetId] || 0
      : Number(gift.actual) || 0;
  const unl = gifts.filter((gift) => !linked(gift));

  const expAll = sum(exp, (item) => Number(item.amount) || 0);
  const expPaid = sum(exp, paidOf);
  const estRun =
    sum(
      budget.filter((item) => (actB[item.id] || 0) > 0),
      bt,
    ) + sum(unl.filter((gift) => gAct(gift) > 0), (gift) => Number(gift.est) || 0);

  const plan = sum(budget, bt);
  const actual = expAll;
  const paid = expPaid;
  const bill = expAll - expPaid;

  const sv = listOf(data, "savings");
  const signed = (saving: (typeof sv)[number]) =>
    saving.type === "Penarikan"
      ? -(Number(saving.amount) || 0)
      : Number(saving.amount) || 0;
  const saldo = sum(sv, signed);
  const saldoA = sum(
    sv.filter((saving) => saving.who === nameA(data)),
    signed,
  );
  const saldoB = sum(
    sv.filter((saving) => saving.who === nameB(data)),
    signed,
  );

  const hadir = gs.filter((guest) => guest.rsvp === "Hadir");
  const tidak = gs.filter((guest) => guest.rsvp === "Tidak Hadir");
  const belum = gs.filter(
    (guest) => guest.rsvp !== "Hadir" && guest.rsvp !== "Tidak Hadir",
  );
  const bought = gifts.filter((gift) => gift.status === "Sudah Dibeli");

  return {
    budget,
    exp,
    ven,
    gs,
    gifts,
    cl,
    unl,
    linked,
    gAct,
    paidB,
    actB,
    paidV,
    bt,
    plan,
    actual,
    paid,
    bill,
    sisa: plan - actual,
    selisih: estRun - actual,
    saldo,
    saldoA,
    saldoB,
    sv,
    signed,
    hadir,
    tidak,
    belum,
    hadirOrang: sum(gs, confOf),
    paxAll: sum(gs, (guest) => Number(guest.pax) || 0),
    sent: gs.filter((guest) => guest.invited === "Sudah").length,
    clDone: cl.filter((task) => stOf(task) === "Selesai").length,
    clProc: cl.filter((task) => stOf(task) === "Dalam Proses").length,
    clAll: cl.length,
    gEst: sum(gifts, (gift) => Number(gift.est) || 0),
    gActAll: sum(gifts, gAct),
    gBought: bought.length,
  };
}

export type Calculation = ReturnType<typeof calculate>;

export const payStatus = (paid: number, total: number) =>
  paid <= 0
    ? (["Belum", ""] as const)
    : paid > total && total > 0
      ? (["Melebihi", "bad"] as const)
      : paid >= total && total > 0
        ? (["Lunas", "ok"] as const)
        : (["DP", "warn"] as const);

export function allocRows(data: PlannerData, calc: Calculation) {
  const cats = catNames(data);
  const rows = cats.map((cat) => {
    const items = calc.budget.filter((item) => item.cat === cat);
    const ids = new Set(items.map((item) => item.id));
    const trx = calc.exp.filter((item) => ids.has(item.budgetId || ""));
    return {
      cat,
      n: items.length,
      t: trx.length,
      est: sum(items, bt),
      act: sum(trx, (item) => Number(item.amount) || 0),
      fixed: 0,
    };
  });
  const noPlan = calc.exp.filter(
    (item) =>
      !item.budgetId || !calc.budget.some((b) => b.id === item.budgetId),
  );
  if (noPlan.length) {
    rows.push({
      fixed: 1,
      cat: "Realisasi tanpa item",
      n: 0,
      t: noPlan.length,
      est: 0,
      act: sum(noPlan, (item) => Number(item.amount) || 0),
    });
  }
  return rows;
}

export function forecast(data: PlannerData, calc: Calculation) {
  const target = Number(data.settings.target) || 0;
  const keys = calc.sv
    .map((item) => String(item.date || "").slice(0, 7))
    .filter(Boolean)
    .sort();
  if (!keys.length) return { none: true, avg: 0, done: false, need: 0, late: 0 };
  const [firstYear, firstMonth] = keys[0].split("-").map(Number);
  const now = new Date();
  const active = Math.max(
    1,
    (now.getFullYear() - firstYear) * 12 + (now.getMonth() + 1 - firstMonth) + 1,
  );
  const avg = calc.saldo / active;
  if (calc.saldo >= target) return { done: true, avg, none: false, need: 0, late: 0 };
  if (avg <= 0) return { avg, none: true, done: false, need: 0, late: 0 };
  const need = Math.ceil((target - calc.saldo) / avg);
  const eta = new Date(now.getFullYear(), now.getMonth() + need, 1);
  let late = 0;
  if (data.settings.weddingDate) {
    const wedding = new Date(`${data.settings.weddingDate}T00:00:00`);
    late =
      (eta.getFullYear() - wedding.getFullYear()) * 12 +
      eta.getMonth() -
      wedding.getMonth();
  }
  return { avg, need, eta, late, done: false, none: false };
}

export function redOf(place: Investment): Redemption[] {
  return Array.isArray(place.redemptions) ? place.redemptions : [];
}

export const remOf = (place: Investment) =>
  Math.max(0, (Number(place.amount) || 0) - sum(redOf(place), (r) => Number(r.principal) || 0));

export const fromRed = (place: Investment) =>
  Boolean(place.src && place.src.type === "pencairan");

export const pStatus = (place: Investment) =>
  redOf(place).length && remOf(place) <= 0
    ? "Dicairkan"
    : place.status === "Jatuh Tempo" ||
        (place.due && place.due <= todayISO())
      ? "Jatuh Tempo"
      : "Berjalan";

export const yieldOf = (place: Investment) =>
  sum(redOf(place), (r) => Number(r.yield) || 0) +
  (remOf(place) > 0 ? Number(place.gain) || 0 : 0);

export const owners = (data: PlannerData) => [
  nameB(data),
  nameA(data),
  "Bersama",
];

export function fund(data: PlannerData) {
  const sv = listOf(data, "savings");
  const inv = listOf(data, "invest");
  const dep = sum(
    sv.filter((item) => item.type !== "Penarikan"),
    (item) => Number(item.amount) || 0,
  );
  const wd = sum(
    sv.filter((item) => item.type === "Penarikan"),
    (item) => Number(item.amount) || 0,
  );
  const net = dep - wd;

  let pool = net;
  inv.forEach((place) => {
    if (!fromRed(place)) pool -= Number(place.amount) || 0;
    redOf(place).forEach((redemption) => {
      if (redemption.dest !== "Instrumen")
        pool += Number(redemption.total) || 0;
    });
  });

  const running = inv.filter((place) => remOf(place) > 0);
  const byKind: Record<string, number> = {};
  INSTR.forEach((kind) => {
    byKind[kind] = 0;
  });
  running.forEach((place) => {
    const kind = INSTR.includes(place.kind || "") ? place.kind! : "Deposito";
    byKind[kind] += remOf(place);
  });
  const pocket = byKind.Tabungan || 0;
  byKind.Tabungan = pool + pocket;
  const invested = sum(
    INSTR.filter((kind) => kind !== "Tabungan"),
    (kind) => byKind[kind],
  );
  const realized = sum(inv, (place) =>
    sum(redOf(place), (redemption) => Number(redemption.yield) || 0),
  );
  const unreal = sum(running, (place) => Number(place.gain) || 0);
  const gain = realized + unreal;

  const byOwner: Record<
    string,
    { n: number; run: number; gain: number }
  > = {};
  inv.forEach((place) => {
    const owner = place.owner || "Bersama";
    const bucket = (byOwner[owner] = byOwner[owner] || {
      n: 0,
      run: 0,
      gain: 0,
    });
    bucket.n += 1;
    bucket.run += remOf(place);
    bucket.gain += yieldOf(place);
  });

  return {
    sv,
    inv,
    dep,
    wd,
    net,
    pool,
    avail: pool + pocket,
    invested,
    byKind,
    realized,
    unreal,
    gain,
    value: net + gain,
    recorded: pool + pocket + invested,
    byOwner,
  };
}

export type Fund = ReturnType<typeof fund>;

export type FeedRow = {
  d: string;
  k: string;
  t: string;
  a: number;
  ord: number;
  act: string;
  id: string;
  who?: string;
  i: number;
};

export function feedOf(data: PlannerData, fd: Fund) {
  const events: Omit<FeedRow, "i">[] = [];
  fd.sv.forEach((item) => {
    events.push({
      d: item.date || "",
      k: item.type === "Penarikan" ? "penarikan" : "setoran",
      t: `${item.type === "Penarikan" ? "Penarikan" : "Setoran"} ${tabLabel(data, item.who)}${item.note ? ` · ${item.note}` : ""}`,
      a: Number(item.amount) || 0,
      ord: 0,
      act: "editSaving",
      id: item.id,
      who: item.who,
    });
  });
  fd.inv.forEach((place) => {
    events.push({
      d: place.date || "",
      k: "penempatan",
      t: `Penempatan ${place.name || ""}${fromRed(place) ? " (dari pencairan)" : ""}`,
      a: Number(place.amount) || 0,
      ord: fromRed(place) ? 4 : 1,
      act: "pview",
      id: place.id,
      who: place.owner,
    });
    redOf(place).forEach((redemption) => {
      events.push({
        d: redemption.date || "",
        k: "pencairan",
        t: `${place.name || ""} dicairkan${Number(redemption.yield) ? ` (pokok ${fmt(Number(redemption.principal) || 0)}, imbal hasil ${fmt(Number(redemption.yield) || 0)})` : ""}`,
        a: Number(redemption.total) || 0,
        ord: 2,
        act: "pview",
        id: place.id,
        who: place.owner,
      });
      const to =
        redemption.dest === "Instrumen"
          ? String(
              data.invest[redemption.destPid || ""]?.name || "instrumen lain",
            )
          : redemption.destAcct || "tabungan";
      events.push({
        d: redemption.date || "",
        k: "alih",
        t: `Dana ${redemption.dest === "Instrumen" ? "dialihkan ke" : "dikembalikan ke"} ${to}`,
        a: Number(redemption.total) || 0,
        ord: 3,
        act: "pview",
        id: place.id,
        who: place.owner,
      });
    });
  });
  return events
    .map((event, index) => ({ ...event, i: index }))
    .sort(
      (a, b) =>
        b.d.localeCompare(a.d) || b.ord - a.ord || b.i - a.i,
    );
}

export const categoryName = (data: PlannerData, id: string) =>
  (data.cats[id] as Category | undefined)?.name || "";
