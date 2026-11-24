export const pad = (value: number) => String(value).padStart(2, "0");

export const fmt = (value: number) =>
  `${value < 0 ? "-" : ""}Rp${Math.round(Math.abs(Number(value) || 0)).toLocaleString("id-ID")}`;

export const short = (value: number) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const trim = (x: number, suffix: string) =>
    `${x.toLocaleString("id-ID", { maximumFractionDigits: 1 })}${suffix}`;
  if (abs >= 1e9) return trim(n / 1e9, " M");
  if (abs >= 1e6) return trim(n / 1e6, " jt");
  if (abs >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return String(n);
};

export const rp = (value: number) => ({
  full: fmt(value),
  short: `${value < 0 ? "-" : ""}Rp${short(Math.abs(value))}`,
});

export const pct = (value: number, total: number) =>
  total > 0
    ? Math.max(0, Math.min(100, Math.round((value / total) * 100)))
    : 0;

export const sum = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);

export const isoOf = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayISO = () => isoOf(new Date());

export const addDays = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return isoOf(date);
};

export const dFmt = (
  iso?: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", options) : "");

export const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const waLink = (phone?: string) => {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "0") digits = `62${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
};

export const mins = (time?: string) => {
  const match = /^(\d\d):(\d\d)/.exec(time || "");
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

export const durTxt = (start?: string, end?: string) => {
  const from = mins(start);
  const to = mins(end);
  if (from == null || to == null) return "";
  let diff = to - from;
  if (diff < 0) diff += 1440;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours ? `${hours} j ` : ""}${minutes ? `${minutes} m` : ""}`.trim() || "0 m";
};

export const hit = (query: string, ...fields: unknown[]) =>
  !query ||
  fields
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const keep = (...sources: (object | undefined | null)[]): any =>
  Object.assign({}, ...sources.filter(Boolean));

export const parseMoney = (value: string) => {
  const text = String(value).trim().toLowerCase().replace(/^rp\.?\s*/, "");
  const match = /^([\d.,]+)\s*(jt|juta|rb|ribu|k)?$/.exec(text);
  if (!match) return null;
  if (match[2]) {
    const n = parseFloat(match[1].replace(",", "."));
    return Math.round(
      n * (match[2] === "jt" || match[2] === "juta" ? 1e6 : 1e3),
    );
  }
  return Number(match[1].replace(/[.,]/g, ""));
};

export const parseList = (text: string) => {
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match =
        /^(.*?)[\s:=\-–—]*((?:rp\.?\s*)?\d[\d.,]*\s*(?:jt|juta|rb|ribu|k)?)$/i.exec(
          line,
        );
      if (match && match[1].trim()) {
        const value = parseMoney(match[2]);
        return {
          name: match[1].trim(),
          price: value == null || Number.isNaN(value) ? 0 : value,
        };
      }
      return { name: line, price: 0 };
    });
};

export const tenor = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const days =
    (new Date(`${end}T00:00:00`).getTime() -
      new Date(`${start}T00:00:00`).getTime()) /
    864e5;
  if (!(days > 0)) return "";
  const months = Math.round(days / 30.4375);
  if (months >= 24)
    return `${(Math.round((months / 12) * 10) / 10).toLocaleString("id-ID")} tahun`;
  if (months >= 1) return `${months} bulan`;
  return `${Math.round(days)} hari`;
};

export const sgn = (value: number) => `${value > 0 ? "+" : ""}${fmt(value)}`;

export const sorted = <T extends { o?: number; date?: string }>(
  items: T[],
  dateFirst = false,
) =>
  [...items].sort((a, b) =>
    dateFirst
      ? String(a.date || "").localeCompare(String(b.date || "")) ||
        (a.o || 0) - (b.o || 0)
      : (a.o || 0) - (b.o || 0) ||
        String(a.date || "").localeCompare(String(b.date || "")),
  );

export const valuesOf = (record?: Record<string, unknown>) =>
  record ? Object.values(record) : [];

export const str = (value: unknown) =>
  value == null ? "" : String(value);

export const num = (value: unknown) => Number(value) || 0;
