import type { PageKey } from "./types";

export const PAGES: Record<
  PageKey,
  { label: string; icon: string; short?: string }
> = {
  beranda: { label: "Beranda", icon: "home" },
  checklist: { label: "Checklist", icon: "check" },
  mahar: { label: "Mahar & Seserahan", icon: "gift" },
  acara: { label: "Acara & Rundown", icon: "clock" },
  dokumen: { label: "Dokumen", icon: "file" },
  catatan: { label: "Catatan", icon: "note" },
  anggaran: { label: "Estimasi Pengeluaran", icon: "wallet", short: "Estimasi" },
  tabungan: { label: "Savings", icon: "heart" },
  vendor: { label: "Vendor", icon: "store" },
  tamu: { label: "Tamu", icon: "users" },
};

export const GROUPS: { title: string; pages: PageKey[] }[] = [
  { title: "", pages: ["beranda"] },
  {
    title: "Persiapan",
    pages: ["checklist", "mahar", "acara", "dokumen", "catatan"],
  },
  { title: "Keuangan", pages: ["anggaran", "tabungan"] },
  { title: "Pihak terkait", pages: ["vendor", "tamu"] },
];

export const MAINTAB: PageKey[] = ["beranda", "checklist", "anggaran", "tamu"];

export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

export const BN_CLR = [
  "var(--c1)",
  "var(--c2)",
  "var(--c3)",
  "var(--c4)",
  "var(--c5)",
  "var(--c6)",
  "var(--c7)",
  "var(--c8)",
];

export const BN_IMAGES = {
  blossom: "/images/planner/bn-blossom.svg",
  cluster: "/images/planner/bn-cluster.svg",
  lav: "/images/planner/bn-lav.svg",
  border: "/images/planner/bn-border.svg",
  couple: "/images/planner/bn-couple.webp",
};

export const FL_IMAGES = {
  corner: "/images/planner/fl-corner.svg",
  sprig: "/images/planner/fl-sprig.svg",
  peony: "/images/planner/fl-peony.svg",
  border: "/images/planner/fl-border.svg",
};

export const TSTAT = ["Belum Dimulai", "Dalam Proses", "Selesai"];

export const EVMAP: Record<string, string> = {
  "Dokumen KUA": "Akad",
  Mahar: "Akad",
  Seserahan: "Akad",
  "Venue & Dekorasi": "Resepsi",
  Catering: "Resepsi",
  Undangan: "Resepsi",
  Tamu: "Resepsi",
  Souvenir: "Resepsi",
  Transportasi: "Resepsi",
  "Foto & Video": "Resepsi",
  "Acara / Hari-H": "Resepsi",
};

export const EVL: Record<string, string> = {
  Akad: "Akad Nikah",
  Resepsi: "Resepsi",
  Umum: "Umum",
};

export const VSTAT = ["Calon", "Negosiasi", "Booked", "Lunas", "Batal"];
export const GSTAT = ["Belum Dibeli", "Dalam Proses", "Sudah Dibeli"];
export const EXST = ["Belum Dibayar", "DP", "Lunas"];
export const NTYPES = [
  "Ide",
  "Hasil Diskusi",
  "Keputusan Keluarga",
  "Perlu Dibahas",
];

export const INSTR = [
  "Tabungan",
  "Deposito",
  "Obligasi / SBN",
  "Reksa Dana",
  "Saham / ETF",
  "Lainnya",
];

export const INSTR_ICON: Record<string, string> = {
  Tabungan: "wallet",
  Deposito: "landmark",
  "Obligasi / SBN": "landmark",
  "Reksa Dana": "trendingUp",
  "Saham / ETF": "trendingUp",
  Lainnya: "layers",
};

export const INSTR_COL: Record<string, string> = {
  Tabungan: "var(--rose-s)",
  Deposito: "var(--butter-s)",
  "Obligasi / SBN": "var(--sage-s)",
  "Reksa Dana": "var(--lav-s)",
  "Saham / ETF": "var(--c6)",
  Lainnya: "var(--c8)",
};

export const SVK: Record<string, [string, string]> = {
  setoran: ["Setoran", "ok"],
  penarikan: ["Penarikan", "bad"],
  penempatan: ["Penempatan", "acc"],
  pencairan: ["Pencairan", "warn"],
  alih: ["Perpindahan", ""],
};

export const PST: Record<string, string> = {
  Berjalan: "ok",
  "Jatuh Tempo": "warn",
  Dicairkan: "acc",
};

export const SV_TABS: [string, string, string][] = [
  ["riwayat", "Riwayat Transaksi", "list"],
  ["invest", "Penempatan Dana & Investasi", "layers"],
  ["rekap", "Rekap Kontribusi", "users"],
];

export const CHECKLIST_TEMPLATE: [string, string, string, number][] = [
  ["Akad", "Dokumen KUA", "Daftar nikah di KUA / SIMKAH", -90],
  ["Akad", "Dokumen KUA", "Ikut kursus pra-nikah (bimbingan perkawinan)", -90],
  ["Akad", "Dokumen KUA", "Konfirmasi penghulu dan jadwal akad", -60],
  ["Akad", "Dokumen KUA", "Tentukan wali dan dua saksi", -60],
  ["Akad", "Dokumen KUA", "Siapkan map berkas dan buku nikah", -14],
  ["Akad", "Mahar", "Tentukan bentuk dan nominal mahar", -120],
  ["Akad", "Mahar", "Siapkan mahar dan wadahnya", -30],
  ["Akad", "Mahar", "Latihan ijab kabul", -14],
  ["Akad", "Seserahan", "Finalisasi daftar seserahan", -90],
  ["Akad", "Seserahan", "Pesan box atau hampers seserahan", -45],
  ["Akad", "Seserahan", "Tulis kartu ucapan seserahan", -30],
  ["Akad", "Seserahan", "Packing seserahan", -7],
  ["Akad", "Busana & MUA", "Pilih busana akad", -90],
  ["Akad", "Busana & MUA", "Makeup trial dan hairdo", -60],
  ["Akad", "Busana & MUA", "Siapkan cincin kawin", -30],
  ["Akad", "Busana & MUA", "Fitting terakhir", -14],
  ["Akad", "Acara / Hari-H", "Susun rundown akad nikah", -30],
  ["Akad", "Acara / Hari-H", "Brief keluarga inti untuk akad", -7],
  ["Resepsi", "Venue & Dekorasi", "Survey dan booking venue", -365],
  ["Resepsi", "Venue & Dekorasi", "Finalisasi layout dan dekorasi", -45],
  ["Resepsi", "Venue & Dekorasi", "Technical meeting dengan vendor", -14],
  ["Resepsi", "Catering", "Food tasting", -120],
  ["Resepsi", "Catering", "Finalisasi menu dan jumlah pax", -30],
  ["Resepsi", "Undangan", "Finalisasi daftar tamu", -90],
  ["Resepsi", "Undangan", "Desain dan cetak undangan", -75],
  ["Resepsi", "Undangan", "Sebar undangan", -45],
  ["Resepsi", "Undangan", "Follow-up RSVP", -21],
  ["Resepsi", "Foto & Video", "Booking fotografer dan videografer", -300],
  ["Resepsi", "Foto & Video", "Buat shot list keluarga", -30],
  ["Resepsi", "Souvenir", "Pesan souvenir", -60],
  [
    "Resepsi",
    "Transportasi",
    "Konfirmasi mobil pengantin dan keluarga",
    -14,
  ],
  ["Resepsi", "Acara / Hari-H", "Susun rundown resepsi", -30],
  ["Resepsi", "Acara / Hari-H", "Siapkan emergency kit", -7],
  ["Resepsi", "Acara / Hari-H", "Brief penerima tamu", -7],
  ["Resepsi", "Acara / Hari-H", "Gladi bersih", -3],
  ["Resepsi", "Acara / Hari-H", "Konfirmasi final seluruh vendor", -3],
  ["Umum", "Honeymoon", "Booking tiket dan hotel honeymoon", -60],
  [
    "Umum",
    "Persiapan Setelah Menikah",
    "Siapkan hunian dan perlengkapan rumah",
    -30,
  ],
  [
    "Umum",
    "Persiapan Setelah Menikah",
    "Urus perubahan KK dan dokumen setelah menikah",
    14,
  ],
];

export const RUNDOWN_TEMPLATE: [string, string, string, string, string][] = [
  [
    "Akad Nikah",
    "07:30",
    "08:00",
    "Persiapan lokasi dan pengecekan akhir",
    "Bersama",
  ],
  [
    "Akad Nikah",
    "08:00",
    "08:30",
    "Kedatangan keluarga, wali, dan saksi",
    "Keluarga",
  ],
  [
    "Akad Nikah",
    "08:30",
    "08:45",
    "Pembukaan dan pembacaan ayat suci",
    "MC",
  ],
  ["Akad Nikah", "08:45", "09:15", "Khutbah nikah dan ijab kabul", "Penghulu"],
  ["Akad Nikah", "09:15", "09:30", "Penandatanganan buku nikah", "Penghulu"],
  [
    "Akad Nikah",
    "09:30",
    "10:00",
    "Tukar cincin, sungkeman, dan doa",
    "Bersama",
  ],
  ["Akad Nikah", "10:00", "10:30", "Foto keluarga", "Fotografer"],
  ["Resepsi", "10:00", "11:30", "Rias dan busana pengantin", "MUA"],
  ["Resepsi", "11:30", "12:00", "Cek sound dan gladi singkat", "MC"],
  ["Resepsi", "12:00", "12:15", "Tamu mulai hadir", "Penerima tamu"],
  ["Resepsi", "12:15", "12:30", "Pembukaan oleh MC", "MC"],
  ["Resepsi", "12:30", "12:45", "Prosesi masuk pengantin", "Bersama"],
  ["Resepsi", "12:45", "13:15", "Sambutan keluarga dan doa", "Keluarga"],
  ["Resepsi", "13:15", "14:30", "Makan dan foto bersama tamu", "Fotografer"],
  ["Resepsi", "14:30", "15:00", "Penutup", "MC"],
];

export const ICON: Record<string, string> = {
  landmark:
    '<path d="M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M12 2l8 5H4z"/>',
  trendingUp:
    '<path d="M22 7l-8.500 8.500-5-5L2 17"/><path d="M16 7h6v6"/>',
  history:
    '<path d="M3 12a9 9 0 109-9 9.750 9.750 0 00-6.740 2.740L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  layers:
    '<path d="M12 3L3 7.500l9 4.500 9-4.500z"/><path d="M3 12l9 4.500 9-4.500"/><path d="M3 16.500L12 21l9-4.500"/>',
  arrowsLR:
    '<path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  calendar:
    '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>',
  chartPie:
    '<path d="M21 12a1 1 0 001-1 10 10 0 00-9-9 1 1 0 00-1 1v8a1 1 0 001 1z"/><path d="M21.210 15.890A10 10 0 118 2.830"/>',
  eye: '<path d="M2.060 12.350a1 1 0 010-.7 10.750 10.750 0 0119.880 0 1 1 0 010 .7 10.750 10.750 0 01-19.880 0"/><circle cx="12" cy="12" r="3"/>',
  pencil:
    '<path d="M21.170 6.810a1 1 0 00-4-4L3.840 16.170a2 2 0 00-.5.830l-1.320 4.350a.5.5 0 00.620.620l4.350-1.320a2 2 0 00.830-.5z"/><path d="M15 5l4 4"/>',
  coins:
    '<circle cx="8" cy="8" r="6"/><path d="M18.090 10.370A6 6 0 1110.340 18M7 6h1v4M16.710 13.880l.7.710-2.820 2.820"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  circleCheck:
    '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5.5"/>',
  wallet:
    '<path d="M4 7h15a1 1 0 011 1v11a1 1 0 01-1 1H5a2 2 0 01-2-2V6a2 2 0 012-2h12"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  store:
    '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0A2.7 2.7 0 0020 9"/><path d="M5 12v8h14v-8"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5a3 3 0 010 6M18 14.6c1.8.7 3 2.4 3 5.4"/>',
  heart:
    '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.5 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  note: '<path d="M5 4h14v12l-5 5H5z"/><path d="M14 21v-5h5M8 9h8M8 13h4"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18v-3H3zM12 6v14"/><path d="M12 6c-1-3-5-3.500-5-1.200C7 6 9 6 12 6zM12 6c1-3 5-3.500 5-1.200 0 1.200-2 1.200-5 1.200z"/>',
  clock:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.500V12l3 2"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.500 4.500"/>',
  tick: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M18.400 5.600l-1.800 1.800M7.400 16.600l-1.800 1.800"/>',
  copy: '<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 16V6a2 2 0 012-2h8"/>',
  link: '<path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
