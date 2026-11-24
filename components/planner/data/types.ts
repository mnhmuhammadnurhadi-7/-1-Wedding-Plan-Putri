export type PlannerItem = { id: string; o?: number } & Record<string, unknown>;

export type Settings = {
  a?: string;
  b?: string;
  weddingDate?: string;
  weddingTime?: string;
  target?: number | string;
  guestTarget?: number | string;
  tabA?: string;
  tabB?: string;
  monthA?: number | string;
  monthB?: number | string;
  akadDate?: string;
  akadTime?: string;
  akadPlace?: string;
  resepsiDate?: string;
  resepsiTime?: string;
  resepsiPlace?: string;
};

export type Task = PlannerItem & {
  task?: string;
  cat?: string;
  event?: string;
  pic?: string;
  due?: string;
  status?: string;
  pri?: string;
  note?: string;
  done?: boolean;
};

export type BudgetItem = PlannerItem & {
  cat?: string;
  name?: string;
  qty?: number | string;
  price?: number | string;
  note?: string;
};

export type Expense = PlannerItem & {
  desc?: string;
  amount?: number | string;
  date?: string;
  status?: string;
  paid?: number | string;
  budgetId?: string;
  vendorId?: string;
  vname?: string;
  method?: string;
  payer?: string;
  proof?: string;
  note?: string;
};

export type Vendor = PlannerItem & {
  name?: string;
  cat?: string;
  pkg?: string;
  quote?: number | string;
  price?: number | string;
  dp?: number | string;
  legacyDp?: number | string;
  payDue?: string;
  pic?: string;
  phone?: string;
  vstatus?: string;
  contract?: string;
  due?: string;
  refUrl?: string;
  contractUrl?: string;
  note?: string;
};

export type Guest = PlannerItem & {
  name?: string;
  group?: string;
  side?: string;
  pax?: number | string;
  wa?: string;
  invited?: string;
  rsvp?: string;
  confirmed?: number | string;
  table?: string;
  rel?: string;
  note?: string;
};

export type Saving = PlannerItem & {
  who?: string;
  amount?: number | string;
  date?: string;
  type?: string;
  method?: string;
  note?: string;
};

export type Redemption = {
  id: string;
  date?: string;
  principal?: number;
  yield?: number;
  total?: number;
  dest?: string;
  destPid?: string;
  destAcct?: string;
  note?: string;
};

export type Investment = PlannerItem & {
  kind?: string;
  name?: string;
  amount?: number | string;
  date?: string;
  due?: string;
  owner?: string;
  note?: string;
  status?: string;
  gain?: number | string;
  redemptions?: Redemption[];
  src?: { type?: string; pid?: string; rid?: string };
};

export type DocumentItem = PlannerItem & {
  name?: string;
  stage?: string;
  who?: string;
  req?: string;
  qty?: string;
  file?: string;
  desc?: string;
  note?: string;
  have?: boolean;
};

export type Note = PlannerItem & {
  type?: string;
  topic?: string;
  note?: string;
  follow?: string;
  pic?: string;
  pri?: string;
  due?: string;
  dueTime?: string;
  status?: string;
  date?: string;
};

export type Gift = PlannerItem & {
  kind?: string;
  group?: string;
  name?: string;
  desc?: string;
  est?: number | string;
  actual?: number | string;
  status?: string;
  pri?: string;
  budgetId?: string;
  photo?: string;
  note?: string;
};

export type EventItem = PlannerItem & {
  kind?: string;
  name?: string;
  start?: string;
  end?: string;
  pic?: string;
  loc?: string;
  note?: string;
  status?: string;
};

export type Category = PlannerItem & { name?: string };

export type PlannerData = {
  settings: Settings;
  checklist: Record<string, Task>;
  budget: Record<string, BudgetItem>;
  expenses: Record<string, Expense>;
  vendors: Record<string, Vendor>;
  guests: Record<string, Guest>;
  savings: Record<string, Saving>;
  docs: Record<string, DocumentItem>;
  notes: Record<string, Note>;
  gifts: Record<string, Gift>;
  events: Record<string, EventItem>;
  cats: Record<string, Category>;
  invest: Record<string, Investment>;
};

export type CollectionKey = Exclude<keyof PlannerData, "settings">;

export type PageKey =
  | "beranda"
  | "checklist"
  | "anggaran"
  | "mahar"
  | "acara"
  | "vendor"
  | "tamu"
  | "tabungan"
  | "dokumen"
  | "catatan";

export type FilterState = {
  page: PageKey;
  cl: {
    ev: string;
    cat: string;
    st: string;
    pic: string;
    q: string;
    collapsed: Record<string, boolean>;
  };
  ag: { tab: string; q: string; st: string };
  gf: { kind: string; view: string; st: string; q: string };
  ac: { kind: string };
  vd: { q: string; cat?: string; st?: string };
  tm: { grp: string; side: string; rsvp: string; q: string };
  tb: { who: string; tab: string; kind: string; type: string; undo: string };
  dk: { stage: string; who: string; q: string };
  ct: { st: string; pic: string; type: string; q: string };
};

export type FormValues = Record<string, string>;

export type FormFieldType =
  | "text"
  | "date"
  | "time"
  | "tel"
  | "select"
  | "area"
  | "money"
  | "num"
  | "attach";

export type FormField = {
  key: string;
  label: string;
  type?: FormFieldType;
  required?: boolean;
  options?: [string, string][];
  half?: boolean;
  hint?: string;
  list?: string[];
  image?: boolean;
};

export type FormSpec = {
  title: string;
  values: FormValues;
  fields: FormField[];
  save: (values: FormValues) => boolean | void;
  onDelete?: () => void;
  onOpen?: (setValue: (key: string, value: string) => void) => void;
};

export type DocRow = { data: unknown; updated_at: string };
