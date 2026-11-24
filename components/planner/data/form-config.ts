import {
  EXST,
  GSTAT,
  INSTR,
  NTYPES,
  TSTAT,
  VSTAT,
} from "./constants";
import {
  catNames,
  confOf,
  evOf,
  exSt,
  fromRed,
  nameA,
  nameB,
  noteType,
  owners,
  redOf,
  remOf,
  sideOf,
  stOf,
  tabLabel,
  vDp,
  vStatus,
} from "./calculations";
import {
  fmt,
  keep,
  parseList,
  todayISO,
  uid,
} from "./helpers";
import type {
  CollectionKey,
  FilterState,
  FormField,
  FormSpec,
  FormValues,
  PlannerData,
  PlannerItem,
  Settings,
} from "./types";
import type { Calculation } from "./calculations";

export type FormType =
  | "task"
  | "cat"
  | "budget"
  | "expense"
  | "list"
  | "target"
  | "vendor"
  | "guest"
  | "saving"
  | "place"
  | "redeem"
  | "doc"
  | "note"
  | "gift"
  | "event"
  | "settings";

export type FormExtra = {
  cat?: string;
  budgetId?: string;
  savingType?: string;
  kind?: string;
};

export type FormDeps = {
  data: PlannerData;
  calc: Calculation;
  ui: FilterState;
  setUi: (updater: (previous: FilterState) => FilterState) => void;
  putItem: (key: CollectionKey, item: PlannerItem) => void;
  putMany: (key: CollectionKey, items: PlannerItem[]) => void;
  delItem: (key: CollectionKey, id: string) => void;
  putSettings: (patch: Partial<Settings>) => void;
  nextOrder: (key: CollectionKey) => number;
  toast: (message: string) => void;
  closeSheet: () => void;
};

const textValue = (value: unknown) =>
  value == null ? "" : String(value);

const valuesFrom = (item?: PlannerItem): FormValues => {
  if (!item) return {};
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      value == null ? "" : String(value),
    ]),
  );
};

const options = (values: (string | [string, string])[]) =>
  values.map(
    (value) => (Array.isArray(value) ? value : [value, value]) as [string, string],
  );

const numberValue = (values: FormValues, key: string) =>
  Number(values[key]) || 0;

const people = (data: PlannerData) => [nameA(data), nameB(data), "Bersama"];

const budgetOptions = (data: PlannerData): [string, string][] => [
  ["", "— Tanpa item —"],
  ...Object.values(data.budget)
    .sort((a, b) => (a.o || 0) - (b.o || 0))
    .map((item) => [
      item.id,
      `${item.cat || ""} · ${item.name || ""}`,
    ] as [string, string]),
];

const vendorOptions = (data: PlannerData): [string, string][] => [
  ["", "— Tanpa vendor —"],
  ...Object.values(data.vendors)
    .sort((a, b) => (a.o || 0) - (b.o || 0))
    .map((vendor) => [vendor.id, vendor.name || ""] as [string, string]),
];

const categories = (data: PlannerData) => [
  ...new Set(
    Object.values(data.cats)
      .map((item) => item.name || "")
      .filter(Boolean),
  ),
];

export function buildFormSpec(
  type: FormType,
  item: PlannerItem | undefined,
  deps: FormDeps,
  extra: FormExtra = {},
): FormSpec {
  const { data, calc, ui, setUi, putItem, putMany, delItem, putSettings } =
    deps;
  const name = nameA(data);
  const partner = nameB(data);

  if (type === "task") {
    const values: FormValues = item
      ? { ...valuesFrom(item), status: stOf(item), event: evOf(item) }
      : {
          status: "Belum Dimulai",
          pri: "Sedang",
          event: ui.cl.ev !== "Semua" ? ui.cl.ev : "Umum",
          cat: ui.cl.cat !== "Semua" ? ui.cl.cat : undefined,
        } as FormValues;
    return {
      title: item ? "Ubah tugas" : "Tambah tugas",
      values,
      fields: [
        { key: "task", label: "Nama tugas", required: true },
        {
          key: "cat",
          label: "Kategori",
          type: "select",
          options: options([
            ...new Set([
              ...Object.values(data.checklist).map((task) => task.cat || ""),
              "Lain-lain",
            ]),
          ]),
          half: true,
        },
        {
          key: "event",
          label: "Untuk acara",
          type: "select",
          options: [
            ["Akad", "Akad Nikah"],
            ["Resepsi", "Resepsi"],
            ["Umum", "Umum"],
          ],
          half: true,
        },
        {
          key: "pic",
          label: "Penanggung jawab",
          type: "select",
          options: [
            ["", "— Belum ditentukan —"],
            ...people(data).map((value) => [value, value] as [string, string]),
          ],
          half: true,
        },
        { key: "due", label: "Deadline", type: "date", half: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: options(TSTAT),
          half: true,
        },
        {
          key: "pri",
          label: "Prioritas",
          type: "select",
          options: options(["Tinggi", "Sedang", "Rendah"]),
          half: true,
        },
        { key: "note", label: "Catatan", type: "area" },
      ],
      save: (values) => {
        const status = values.status;
        putItem(
          "checklist",
          keep(item, values, {
            id: item?.id || uid("c"),
            o: item?.o ?? deps.nextOrder("checklist"),
            done: status === "Selesai",
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("checklist", item.id) : undefined,
    };
  }

  if (type === "cat") {
    const current = extra.cat || "";
    const items = current
      ? Object.values(data.budget).filter((entry) => entry.cat === current)
      : [];
    const record = current
      ? categories(data).includes(current)
        ? Object.values(data.cats).find((entry) => entry.name === current)
        : undefined
      : undefined;
    return {
      title: current ? "Ubah kategori" : "Tambah kategori",
      values: { name: current },
      fields: [
        {
          key: "name",
          label: "Nama kategori",
          required: true,
          hint:
            current && items.length
              ? `${items.length} item ikut pindah ke nama baru.`
              : "",
        },
      ],
      save: (values) => {
        const nextName = (values.name || "").trim();
        if (!nextName) {
          deps.toast("Isi nama kategori");
          return false;
        }
        if (
          nextName !== current &&
          catNames(data).some(
            (entry) =>
              entry.toLowerCase() === nextName.toLowerCase() &&
              entry !== current,
          )
        ) {
          deps.toast("Nama kategori sudah dipakai");
          return false;
        }
        if (!current) {
          putItem("cats", {
            id: uid("k"),
            name: nextName,
            o: deps.nextOrder("cats"),
          });
          return;
        }
        if (nextName === current) return;
        if (items.length) {
          putMany(
            "budget",
            items.map((entry) => keep(entry, { cat: nextName }) as PlannerItem),
          );
        }
        putItem(
          "cats",
          keep({ o: deps.nextOrder("cats") }, record, {
            name: nextName,
            id: record?.id || uid("k"),
          }) as PlannerItem,
        );
      },
      onDelete:
        current && record
          ? () => {
              if (Object.values(data.budget).some((entry) => entry.cat === current)) {
                deps.toast(
                  "Kategori masih punya item. Hapus atau pindahkan item dulu.",
                );
                return;
              }
              delItem("cats", record.id);
            }
          : undefined,
    };
  }

  if (type === "budget") {
    return {
      title: item ? "Ubah item estimasi" : "Tambah item estimasi",
      values: item ? valuesFrom(item) : { cat: extra.cat || "" },
      fields: [
        {
          key: "cat",
          label: "Kategori",
          required: true,
          list: catNames(data),
        },
        { key: "name", label: "Nama item", required: true },
        { key: "qty", label: "Jumlah", type: "num", half: true },
        {
          key: "price",
          label: "Estimasi harga satuan",
          type: "money",
          half: true,
        },
        { key: "note", label: "Keterangan" },
      ],
      save: (values) => {
        putItem(
          "budget",
          keep({ o: deps.nextOrder("budget") }, item, values, {
            qty: Number(values.qty) || 1,
            price: numberValue(values, "price"),
            id: item?.id || uid("b"),
          }) as PlannerItem,
        );
      },
      onDelete:
        item && calc.actB[item.id]
          ? () => {
              deps.toast(
                "Item ini punya realisasi. Hapus atau pindahkan realisasinya dulu.",
              );
            }
          : item
            ? () => delItem("budget", item.id)
            : undefined,
    };
  }

  if (type === "expense") {
    const status = item ? exSt(item) : "Lunas";
    return {
      title: item ? "Ubah realisasi" : "Catat realisasi",
      values: item
        ? {
            ...valuesFrom(item),
            status,
            paid:
              status === "Lunas"
                ? textValue(item.amount)
                : textValue(item.paid),
          }
        : {
            date: todayISO(),
            method: "Transfer",
            payer: name,
            status: "Lunas",
            budgetId: extra.budgetId || "",
          },
      fields: [
        { key: "desc", label: "Keterangan", required: true },
        {
          key: "amount",
          label: "Total biaya / tagihan",
          type: "money",
          required: true,
          half: true,
        },
        {
          key: "date",
          label: "Tanggal transaksi",
          type: "date",
          required: true,
          half: true,
        },
        {
          key: "status",
          label: "Status pembayaran",
          type: "select",
          options: EXST.map((status) => [
            status,
            status === "DP" ? "DP (dibayar sebagian)" : status,
          ]),
          half: true,
        },
        {
          key: "paid",
          label: "Sudah dibayar",
          type: "money",
          half: true,
          hint: "Isi untuk DP. Lunas = sama dengan total, Belum Dibayar = 0.",
        },
        {
          key: "budgetId",
          label: "Item estimasi",
          type: "select",
          options: budgetOptions(data),
        },
        {
          key: "vendorId",
          label: "Vendor (dari daftar)",
          type: "select",
          options: vendorOptions(data),
        },
        {
          key: "vname",
          label: "Nama vendor (jika tidak ada di daftar)",
        },
        {
          key: "method",
          label: "Metode",
          type: "select",
          options: options(["Transfer", "Cash", "QRIS", "Kartu"]),
          half: true,
        },
        {
          key: "payer",
          label: "Dibayar oleh",
          type: "select",
          options: people(data).map((value) => [value, value] as [string, string]),
          half: true,
        },
        {
          key: "proof",
          label: "Bukti transaksi",
          type: "attach",
          image: true,
        },
        { key: "note", label: "Catatan" },
      ],
      save: (values) => {
        const amount = numberValue(values, "amount");
        let paid = numberValue(values, "paid");
        if (values.status === "DP" && !(paid > 0 && paid < amount)) {
          deps.toast("Nominal DP harus lebih dari 0 dan kurang dari total");
          return false;
        }
        paid =
          values.status === "Lunas"
            ? amount
            : values.status === "DP"
              ? paid
              : 0;
        putItem(
          "expenses",
          keep(item, values, {
            amount,
            paid,
            id: item?.id || uid("e"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("expenses", item.id) : undefined,
    };
  }

  if (type === "list") {
    return {
      title: "Tambah banyak item estimasi",
      values: { cat: extra.cat || "" },
      fields: [
        {
          key: "cat",
          label: "Kategori",
          required: true,
          list: catNames(data),
          hint: "Pilih atau ketik kategori baru.",
        },
        {
          key: "text",
          label: "Daftar item",
          type: "area",
          required: true,
          hint: "Satu baris satu item, lalu nominalnya. Contoh:<br>Cincin kawin 3.500.000<br>Mahar uang tunai 2jt<br>Seserahan sepatu 750rb",
        },
      ],
      save: (values) => {
        const rows = parseList(values.text);
        if (!rows.length) {
          deps.toast("Isi minimal satu baris");
          return false;
        }
        let order = deps.nextOrder("budget");
        putMany(
          "budget",
          rows.map((row) => ({
            id: `${uid("b")}${Math.random().toString(36).slice(2, 4)}`,
            o: order++,
            cat: values.cat,
            name: row.name,
            qty: 1,
            price: row.price,
            note: "",
          })) as PlannerItem[],
        );
        const missing = rows.filter((row) => !row.price).length;
        deps.toast(
          `${rows.length} item ditambahkan${missing ? `. ${missing} item belum ada nominal, isi lewat Ubah.` : ""}`,
        );
      },
    };
  }

  if (type === "target") {
    return {
      title: "Atur target dana nikah",
      values: {
        target: textValue(data.settings.target),
        monthB: textValue(data.settings.monthB),
        monthA: textValue(data.settings.monthA),
      },
      fields: [
        {
          key: "target",
          label: "Target dana nikah (total)",
          type: "money",
          required: true,
          hint: "Angka ini Anda yang menentukan. Ubah kapan saja.",
        },
        {
          key: "monthB",
          label: `Target setoran bulanan ${partner}`,
          type: "money",
          half: true,
        },
        {
          key: "monthA",
          label: `Target setoran bulanan ${name}`,
          type: "money",
          half: true,
        },
      ],
      save: (values) =>
        putSettings({
          target: numberValue(values, "target"),
          monthB: numberValue(values, "monthB"),
          monthA: numberValue(values, "monthA"),
        }),
    };
  }

  if (type === "vendor") {
    return {
      title: item ? "Ubah vendor" : "Tambah vendor",
      values: item
        ? {
            ...valuesFrom(item),
            dp: textValue(vDp(item)),
            vstatus: String(
              item.vstatus ||
              vStatus(item, calc.paidV[item.id] || 0),
            ),
          }
        : { vstatus: "Calon", contract: "Belum" },
      fields: [
        { key: "name", label: "Nama vendor", required: true },
        {
          key: "cat",
          label: "Kategori layanan",
          required: true,
          list: [
            ...new Set(
              Object.values(data.vendors)
                .map((vendor) => vendor.cat || "")
                .filter(Boolean),
            ),
          ],
        },
        { key: "pkg", label: "Paket / detail" },
        { key: "quote", label: "Harga penawaran", type: "money", half: true },
        {
          key: "price",
          label: "Harga kesepakatan",
          type: "money",
          half: true,
        },
        {
          key: "dp",
          label: "DP disepakati",
          type: "money",
          half: true,
          hint: "Pembayaran dicatat di Anggaran.",
        },
        {
          key: "payDue",
          label: "Deadline pelunasan",
          type: "date",
          half: true,
        },
        { key: "pic", label: "Nama kontak", half: true },
        { key: "phone", label: "No. HP / WhatsApp", type: "tel", half: true },
        {
          key: "vstatus",
          label: "Status vendor",
          type: "select",
          options: options(VSTAT),
          half: true,
        },
        {
          key: "contract",
          label: "Kontrak",
          type: "select",
          options: options(["Belum", "Sudah"]),
          half: true,
        },
        { key: "due", label: "Tanggal acara", type: "date" },
        { key: "refUrl", label: "Link referensi", type: "attach" },
        { key: "contractUrl", label: "Dokumen kontrak", type: "attach" },
        { key: "note", label: "Catatan", type: "area" },
      ],
      save: (values) => {
        putItem(
          "vendors",
          keep({ o: deps.nextOrder("vendors") }, item, values, {
            quote: numberValue(values, "quote"),
            price: numberValue(values, "price"),
            dp: numberValue(values, "dp"),
            id: item?.id || uid("v"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("vendors", item.id) : undefined,
    };
  }

  if (type === "guest") {
    return {
      title: item ? "Ubah tamu" : "Tambah tamu",
      values: item
        ? {
            ...valuesFrom(item),
            side: sideOf(data, item),
            confirmed:
              item.rsvp === "Hadir"
                ? textValue(confOf(item))
                : textValue(item.confirmed),
          }
        : {
            group: ui.tm.grp !== "Semua" ? ui.tm.grp : "",
            side:
              ui.tm.side !== "Semua" && ui.tm.side !== "-"
                ? ui.tm.side
                : "",
            pax: "1",
            invited: "Belum",
            rsvp: "Belum",
            confirmed: "0",
          },
      fields: [
        { key: "name", label: "Nama tamu", required: true },
        {
          key: "side",
          label: "Pihak keluarga / tamu",
          type: "select",
          options: [
            ["", "— Belum diatur —"],
            [partner, `Pihak ${partner}`],
            [name, `Pihak ${name}`],
          ],
          half: true,
        },
        {
          key: "group",
          label: "Kelompok",
          required: true,
          half: true,
          list: [
            ...new Set(
              Object.values(data.guests)
                .map((guest) => guest.group || "")
                .filter(Boolean),
            ),
          ],
        },
        {
          key: "pax",
          label: "Jumlah orang dalam undangan",
          type: "num",
          half: true,
        },
        { key: "wa", label: "Nomor WhatsApp", type: "tel", half: true },
        {
          key: "invited",
          label: "Status undangan",
          type: "select",
          options: [
            ["Belum", "Belum dikirim"],
            ["Sudah", "Terkirim"],
          ],
          half: true,
        },
        {
          key: "rsvp",
          label: "RSVP",
          type: "select",
          options: options(["Belum", "Hadir", "Tidak Hadir"]),
          half: true,
        },
        {
          key: "confirmed",
          label: "Jumlah konfirmasi hadir",
          type: "num",
          half: true,
        },
        { key: "table", label: "Meja", half: true },
        { key: "rel", label: "Hubungan" },
        { key: "note", label: "Catatan" },
      ],
      save: (values) => {
        const pax = Math.max(1, numberValue(values, "pax"));
        let confirmed = Math.min(numberValue(values, "confirmed"), pax);
        if (values.rsvp === "Hadir" && !numberValue(values, "confirmed")) {
          confirmed = pax;
        }
        if (values.rsvp !== "Hadir") confirmed = 0;
        putItem(
          "guests",
          keep({ o: deps.nextOrder("guests") }, item, values, {
            pax,
            confirmed,
            id: item?.id || uid("g"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("guests", item.id) : undefined,
    };
  }

  if (type === "saving") {
    return {
      title: item
        ? "Ubah catatan tabungan"
        : extra.savingType === "Penarikan"
          ? "Catat penarikan"
          : "Tambah setoran",
      values: item
        ? valuesFrom(item)
        : {
            date: todayISO(),
            type: extra.savingType || "Setoran",
            method: "Transfer",
            who: name,
          },
      fields: [
        {
          key: "who",
          label: "Pemilik rekening",
          type: "select",
          options: [
            [partner, tabLabel(data, partner)],
            [name, tabLabel(data, name)],
          ],
        },
        {
          key: "amount",
          label: "Nominal",
          type: "money",
          required: true,
          half: true,
        },
        {
          key: "date",
          label: "Tanggal",
          type: "date",
          required: true,
          half: true,
        },
        {
          key: "type",
          label: "Jenis",
          type: "select",
          options: options(["Setoran", "Penarikan"]),
          half: true,
        },
        {
          key: "method",
          label: "Metode",
          type: "select",
          options: options(["Transfer", "Cash", "QRIS"]),
          half: true,
        },
        { key: "note", label: "Keterangan" },
      ],
      save: (values) => {
        putItem(
          "savings",
          keep(item, values, {
            amount: numberValue(values, "amount"),
            id: item?.id || uid("s"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("savings", item.id) : undefined,
    };
  }

  if (type === "place") {
    return {
      title: item ? "Ubah penempatan" : "Tambah penempatan dana",
      values: item
        ? {
            ...valuesFrom(item),
            status: item.status === "Jatuh Tempo" ? "Jatuh Tempo" : "Berjalan",
          }
        : {
            kind: "Deposito",
            date: todayISO(),
            owner: "Bersama",
          },
      fields: [
        {
          key: "kind",
          label: "Jenis instrumen",
          type: "select",
          options: options(INSTR),
          half: true,
        },
        {
          key: "owner",
          label: "Pemilik / sumber dana",
          type: "select",
          options: owners(data).map((value) => [value, value] as [string, string]),
          half: true,
        },
        {
          key: "name",
          label: "Nama produk atau tempat penyimpanan",
          required: true,
          hint: "Contoh: Deposito BNI, SBN ORI030, Reksa Dana Pasar Uang. Semua diisi manual.",
        },
        {
          key: "amount",
          label: "Nominal penempatan",
          type: "money",
          required: true,
          half: true,
          hint:
            item && fromRed(item)
              ? "Nominal berasal dari pencairan dan tidak bisa diubah di sini."
              : "",
        },
        {
          key: "date",
          label: "Tanggal penempatan",
          type: "date",
          required: true,
          half: true,
        },
        {
          key: "due",
          label: "Jatuh tempo (opsional)",
          type: "date",
          half: true,
        },
        ...(item
          ? ([
              {
                key: "status",
                label: "Status",
                type: "select",
                options: options(["Berjalan", "Jatuh Tempo"]),
                half: true,
              },
            ] as FormField[])
          : []),
        {
          key: "gain",
          label: "Imbal hasil saat ini (opsional)",
          type: "num",
          half: true,
          hint: "Diisi sendiri, boleh minus. Hanya untuk dana yang belum dicairkan.",
        },
        { key: "note", label: "Keterangan" },
      ],
      save: (values) => {
        if (item) {
          const principal = redOf(item).reduce(
            (total, redemption) => total + (Number(redemption.principal) || 0),
            0,
          );
          if (numberValue(values, "amount") < principal) {
            deps.toast(
              `Nominal tidak boleh di bawah pokok yang sudah dicairkan (${fmt(principal)})`,
            );
            return false;
          }
        }
        if (
          values.due &&
          values.date &&
          values.due < values.date
        ) {
          deps.toast(
            "Jatuh tempo tidak boleh sebelum tanggal penempatan",
          );
          return false;
        }
        const locked = item && fromRed(item);
        const amount = locked
          ? Number(item.amount) || 0
          : numberValue(values, "amount");
        const closed =
          item && redOf(item).length > 0 && remOf(item) <= 0;
        putItem(
          "invest",
          keep(
            { o: deps.nextOrder("invest"), redemptions: [], src: { type: "tabungan" } },
            item,
            values,
            {
              amount,
              gain: numberValue(values, "gain"),
              status: closed
                ? "Dicairkan"
                : values.status || "Berjalan",
              id: item?.id || uid("i"),
            },
          ) as PlannerItem,
        );
        setUi((previous) => ({
          ...previous,
          tb: { ...previous.tb, tab: "invest" },
        }));
      },
      onDelete: item
        ? () => {
            if (redOf(item).length) {
              deps.toast(
                "Penempatan yang sudah dicairkan tidak bisa dihapus. Riwayatnya tetap tersimpan.",
              );
              return;
            }
            if (fromRed(item)) {
              deps.toast("Dana ini berasal dari pencairan. Batalkan pencairannya dulu.");
              return;
            }
            delItem("invest", item.id);
          }
        : undefined,
    };
  }

  if (type === "redeem" && item) {
    const remaining = remOf(item);
    return {
      title: `Catat pencairan · ${item.name || ""}`,
      values: {
        date: todayISO(),
        principal: textValue(remaining),
        yield: "0",
        total: textValue(remaining),
        dest: "Tabungan",
        destAcct: tabLabel(data, name),
        destKind: "Deposito",
        destDue: "",
      },
      fields: [
        {
          key: "date",
          label: "Tanggal pencairan",
          type: "date",
          required: true,
          half: true,
        },
        {
          key: "principal",
          label: "Nominal pokok yang dicairkan",
          type: "money",
          required: true,
          half: true,
          hint: `Sisa penempatan ${fmt(remaining)}.`,
        },
        {
          key: "yield",
          label: "Imbal hasil yang diperoleh",
          type: "num",
          half: true,
          hint: "Boleh minus bila rugi.",
        },
        {
          key: "total",
          label: "Total nominal pencairan",
          type: "money",
          half: true,
          hint: "Pokok ditambah imbal hasil, dihitung otomatis.",
        },
        {
          key: "dest",
          label: "Tujuan dana setelah pencairan",
          type: "select",
          options: [
            ["Tabungan", "Dikembalikan ke tabungan"],
            ["Instrumen", "Dialihkan ke instrumen investasi lain"],
          ],
        },
        {
          key: "destAcct",
          label: "Masuk ke rekening tabungan",
          type: "select",
          options: [
            [tabLabel(data, partner), tabLabel(data, partner)],
            [tabLabel(data, name), tabLabel(data, name)],
          ],
        },
        {
          key: "destKind",
          label: "Jenis instrumen tujuan",
          type: "select",
          options: options(INSTR.filter((kind) => kind !== "Tabungan")),
          half: true,
        },
        {
          key: "destName",
          label: "Nama instrumen tujuan",
          half: true,
          hint: "Penempatan baru dibuat otomatis dari dana pencairan.",
        },
        {
          key: "destDue",
          label: "Jatuh tempo tujuan (opsional)",
          type: "date",
        },
        { key: "note", label: "Keterangan" },
      ],
      save: (values) => {
        const principal = numberValue(values, "principal");
        if (!(principal > 0)) {
          deps.toast("Isi nominal pokok yang dicairkan");
          return false;
        }
        if (principal > remaining) {
          deps.toast(`Pokok melebihi sisa penempatan (${fmt(remaining)})`);
          return false;
        }
        const gain = numberValue(values, "yield");
        const total = principal + gain;
        if (total <= 0) {
          deps.toast("Total pencairan harus lebih dari 0");
          return false;
        }
        if (values.dest === "Instrumen" && !values.destName) {
          deps.toast("Isi nama instrumen tujuan");
          return false;
        }
        if (values.destDue && values.destDue < values.date) {
          deps.toast(
            "Jatuh tempo tujuan tidak boleh sebelum tanggal pencairan",
          );
          return false;
        }
        const redemptionId = uid("r");
        const redemption = {
          id: redemptionId,
          date: values.date,
          principal,
          yield: gain,
          total,
          dest: values.dest,
          note: values.note || "",
          destAcct: "",
          destPid: "",
        };
        const next: PlannerItem[] = [];
        if (values.dest === "Instrumen") {
          const order = deps.nextOrder("invest");
          const placeId = uid("i");
          next.push({
            id: placeId,
            o: order + 1,
            kind: values.destKind,
            name: values.destName,
            amount: total,
            date: values.date,
            due: values.destDue || "",
            owner: item.owner || "Bersama",
            note: `Dari pencairan ${item.name || ""}`,
            status: "Berjalan",
            gain: 0,
            redemptions: [],
            src: { type: "pencairan", pid: item.id, rid: redemptionId },
          });
          redemption.destPid = placeId;
        } else {
          redemption.destAcct = values.destAcct;
        }
        next.unshift(
          keep(item, {
            redemptions: [...redOf(item), redemption],
            status:
              remaining - principal <= 0
                ? "Dicairkan"
                : item.status || "Berjalan",
            gain: remaining - principal <= 0 ? 0 : item.gain,
          }) as PlannerItem,
        );
        putMany("invest", next);
        setUi((previous) => ({
          ...previous,
          tb: { ...previous.tb, tab: "invest" },
        }));
        deps.toast("Pencairan dicatat");
      },
    };
  }

  if (type === "doc") {
    return {
      title: item ? "Ubah dokumen" : "Tambah dokumen",
      values: item
        ? valuesFrom(item)
        : {
            stage: ui.dk.stage !== "Semua" ? ui.dk.stage : "KUA",
            who: "Keduanya",
            req: "Ya",
          },
      fields: [
        { key: "name", label: "Nama dokumen", required: true },
        {
          key: "stage",
          label: "Tahap / jenis",
          required: true,
          half: true,
          list: [
            ...new Set([
              ...Object.values(data.docs).map((doc) => doc.stage || ""),
              "Kelurahan",
              "KUA",
              "KTP & KK",
              "Kontrak Vendor",
              "Bukti Pembayaran",
              "Lainnya",
            ]),
          ],
        },
        {
          key: "who",
          label: "Untuk",
          type: "select",
          options: [
            ["Perempuan", partner],
            ["Laki-laki", name],
            ["Keduanya", "Keduanya"],
          ],
          half: true,
        },
        {
          key: "req",
          label: "Sifat",
          type: "select",
          options: [
            ["Ya", "Wajib"],
            ["Kondisional", "Kondisional"],
          ],
          half: true,
        },
        { key: "qty", label: "Jumlah", half: true },
        {
          key: "file",
          label: "Berkas (scan atau foto)",
          type: "attach",
        },
        { key: "desc", label: "Keterangan", type: "area" },
        { key: "note", label: "Catatan" },
      ],
      save: (values) => {
        putItem(
          "docs",
          keep({ have: false, o: deps.nextOrder("docs") }, item, values, {
            id: item?.id || uid("d"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("docs", item.id) : undefined,
    };
  }

  if (type === "note") {
    return {
      title: item ? "Ubah catatan" : "Tambah catatan",
      values: item
        ? { ...valuesFrom(item), type: noteType(item) }
        : {
            date: todayISO(),
            status: "Open",
            pri: "Sedang",
            pic: "Bersama",
            type: "Ide",
          },
      fields: [
        {
          key: "type",
          label: "Jenis catatan",
          type: "select",
          options: options(NTYPES),
          half: true,
        },
        { key: "topic", label: "Topik", required: true, half: true },
        { key: "note", label: "Catatan", type: "area", required: true },
        { key: "follow", label: "Tindak lanjut" },
        {
          key: "pic",
          label: "PIC",
          type: "select",
          options: people(data).map((value) => [value, value] as [string, string]),
          half: true,
        },
        {
          key: "pri",
          label: "Prioritas",
          type: "select",
          options: options(["Tinggi", "Sedang", "Rendah"]),
          half: true,
        },
        { key: "due", label: "Tenggat (tanggal)", type: "date", half: true },
        { key: "dueTime", label: "Jam", type: "time", half: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: options(["Open", "Selesai"]),
        },
      ],
      save: (values) => {
        putItem(
          "notes",
          keep(
            { o: deps.nextOrder("notes"), date: todayISO() },
            item,
            values,
            { id: item?.id || uid("n") },
          ) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("notes", item.id) : undefined,
    };
  }

  if (type === "gift") {
    return {
      title: item ? "Ubah barang" : "Tambah barang",
      values: item
        ? valuesFrom(item)
        : {
            kind: ui.gf.kind === "Mahar" ? "Mahar" : "Seserahan",
            status: "Belum Dibeli",
            pri: "Sedang",
          },
      fields: [
        {
          key: "kind",
          label: "Kategori",
          type: "select",
          options: options(["Mahar", "Seserahan"]),
          half: true,
        },
        {
          key: "group",
          label: "Grup",
          required: true,
          half: true,
          list: [
            ...new Set(
              Object.values(data.gifts)
                .map((gift) => gift.group || "")
                .filter(Boolean),
            ),
          ],
        },
        { key: "name", label: "Nama barang", required: true },
        { key: "desc", label: "Deskripsi" },
        {
          key: "est",
          label: "Estimasi harga",
          type: "money",
          half: true,
        },
        {
          key: "actual",
          label: "Harga aktual",
          type: "money",
          half: true,
          hint: "Jika dihubungkan ke pos anggaran, aktual diambil dari transaksi pos itu.",
        },
        {
          key: "status",
          label: "Status pengadaan",
          type: "select",
          options: options(GSTAT),
          half: true,
        },
        {
          key: "pri",
          label: "Prioritas pembelian",
          type: "select",
          options: options(["Tinggi", "Sedang", "Rendah"]),
          half: true,
        },
        {
          key: "budgetId",
          label: "Hubungkan ke pos anggaran",
          type: "select",
          options: budgetOptions(data),
        },
        {
          key: "photo",
          label: "Foto referensi",
          type: "attach",
          image: true,
        },
        { key: "note", label: "Catatan", type: "area" },
      ],
      save: (values) => {
        putItem(
          "gifts",
          keep({ o: deps.nextOrder("gifts") }, item, values, {
            est: numberValue(values, "est"),
            actual: numberValue(values, "actual"),
            id: item?.id || uid("m"),
          }) as PlannerItem,
        );
      },
      onDelete: item ? () => delItem("gifts", item.id) : undefined,
    };
  }

  if (type === "event") {
    return {
      title: item ? "Ubah agenda" : "Tambah agenda",
      values: item
        ? valuesFrom(item)
        : { kind: ui.ac.kind, status: "Belum Dimulai" },
      fields: [
        {
          key: "kind",
          label: "Acara",
          type: "select",
          options: options(["Akad Nikah", "Resepsi"]),
        },
        { key: "name", label: "Nama kegiatan", required: true },
        {
          key: "start",
          label: "Waktu mulai",
          type: "time",
          required: true,
          half: true,
        },
        { key: "end", label: "Waktu selesai", type: "time", half: true },
        {
          key: "pic",
          label: "Penanggung jawab (PIC)",
          list: [
            name,
            partner,
            "Bersama",
            "MC",
            "Keluarga",
            "Fotografer",
            "MUA",
          ],
        },
        { key: "loc", label: "Lokasi" },
        { key: "note", label: "Catatan atau perlengkapan", type: "area" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: options(["Belum Dimulai", "Selesai"]),
        },
      ],
      save: (values) => {
        putItem(
          "events",
          keep({ o: deps.nextOrder("events") }, item, values, {
            id: item?.id || uid("r"),
          }) as PlannerItem,
        );
        setUi((previous) => ({
          ...previous,
          ac: { ...previous.ac, kind: values.kind },
        }));
      },
      onDelete: item ? () => delItem("events", item.id) : undefined,
    };
  }

  return {
    title: "Pengaturan",
    values: valuesFrom({ id: "s", ...data.settings } as PlannerItem),
    fields: [
      { key: "a", label: "Nama pasangan 1", required: true, half: true },
      { key: "b", label: "Nama pasangan 2", required: true, half: true },
      {
        key: "weddingDate",
        label: "Tanggal pernikahan",
        type: "date",
        required: true,
        half: true,
      },
      { key: "weddingTime", label: "Jam acara", type: "time", half: true },
      { key: "target", label: "Target dana nikah", type: "money" },
      { key: "guestTarget", label: "Target jumlah undangan", type: "num" },
      {
        key: "tabB",
        label: "Nama rekening 2",
        hint: "Contoh: Tabungan Putri Sofiyani (Sofiya)",
      },
      { key: "tabA", label: "Nama rekening 1", hint: "Contoh: Tabungan Antariksa (Izza)" },
      {
        key: "monthB",
        label: "Target bulanan rekening 2",
        type: "money",
        half: true,
      },
      {
        key: "monthA",
        label: "Target bulanan rekening 1",
        type: "money",
        half: true,
      },
      {
        key: "akadDate",
        label: "Tanggal akad (jika beda)",
        type: "date",
        half: true,
      },
      { key: "akadTime", label: "Jam akad", type: "time", half: true },
      { key: "akadPlace", label: "Lokasi akad" },
      {
        key: "resepsiDate",
        label: "Tanggal resepsi (jika beda)",
        type: "date",
        half: true,
      },
      { key: "resepsiTime", label: "Jam resepsi", type: "time", half: true },
      { key: "resepsiPlace", label: "Lokasi resepsi" },
    ],
    save: (values) =>
      putSettings({
        ...(values as Partial<Settings>),
        target: numberValue(values, "target"),
        guestTarget: numberValue(values, "guestTarget"),
        monthA: numberValue(values, "monthA"),
        monthB: numberValue(values, "monthB"),
      }),
  };
}
