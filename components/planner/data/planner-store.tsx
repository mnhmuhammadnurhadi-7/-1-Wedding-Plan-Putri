"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FormSheet } from "../forms/form-sheet";
import {
  checkAuth,
  mergeDocument,
  readAll,
  saveExport,
  writeDocument,
} from "./api";
import { calculate, fund } from "./calculations";
import { PAGE_KEYS } from "./constants";
import {
  buildFormSpec,
  type FormExtra,
  type FormType,
} from "./form-config";
import type {
  CollectionKey,
  FilterState,
  FormValues,
  PageKey,
  PlannerData,
  PlannerItem,
  Settings,
} from "./types";

type AuthState = {
  required: boolean;
  ok: boolean;
  session?: { name: string; role: string; canWrite: boolean };
};

type PlannerContextValue = {
  data: PlannerData;
  calc: ReturnType<typeof calculate>;
  fund: ReturnType<typeof fund>;
  ui: FilterState;
  ready: boolean;
  error: boolean;
  auth: AuthState;
  canWrite: boolean;
  syncPending: number;
  lastUpdated: Date | null;
  toastMessage: string;
  setUi: (updater: (previous: FilterState) => FilterState) => void;
  setFilter: (group: keyof FilterState, key: string, value: string) => void;
  go: (page: PageKey, set?: string) => void;
  toast: (message: string) => void;
  putItem: (key: CollectionKey, item: PlannerItem) => void;
  putMany: (key: CollectionKey, items: PlannerItem[]) => void;
  delItem: (key: CollectionKey, id: string) => void;
  putSettings: (patch: Partial<Settings>) => void;
  nextOrder: (key: CollectionKey) => number;
  openForm: (
    type: FormType,
    item?: PlannerItem,
    extra?: FormExtra,
  ) => void;
  openSheet: (node: ReactNode) => void;
  closeSheet: () => void;
  exportData: () => Promise<void>;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

const emptyData = (): PlannerData => ({
  settings: {},
  checklist: {},
  budget: {},
  expenses: {},
  vendors: {},
  guests: {},
  savings: {},
  docs: {},
  notes: {},
  gifts: {},
  events: {},
  cats: {},
  invest: {},
});

const initialUi = (): FilterState => ({
  page: "beranda",
  cl: {
    ev: "Semua",
    cat: "Semua",
    st: "Semua",
    pic: "Semua",
    q: "",
    collapsed: {},
  },
  ag: { tab: "banding", q: "", st: "Semua" },
  gf: { kind: "Semua", view: "grup", st: "Semua", q: "" },
  ac: { kind: "Akad Nikah" },
  vd: { q: "", cat: "Semua", st: "Semua" },
  tm: { grp: "Semua", side: "Semua", rsvp: "Semua", q: "" },
  tb: {
    who: "Semua",
    tab: "invest",
    kind: "Semua",
    type: "Semua",
    undo: "",
  },
  dk: { stage: "Semua", who: "Semua", q: "" },
  ct: { st: "Open", pic: "Semua", type: "Semua", q: "" },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pageFromHash = (): PageKey => {
  if (typeof window === "undefined") return "beranda";
  const hash = window.location.hash.replace(/^#/, "");
  return (PAGE_KEYS as string[]).includes(hash) ? (hash as PageKey) : "beranda";
};

function documentsToData(docs: Record<string, { data: unknown }>): PlannerData {
  const next = emptyData();
  const settings = docs.settings?.data;
  if (isRecord(settings)) next.settings = settings as Settings;

  for (const key of Object.keys(next) as (keyof PlannerData)[]) {
    if (key === "settings") continue;
    const row = docs[key]?.data;
    if (isRecord(row) && isRecord(row.items)) {
      (next[key] as Record<string, PlannerItem>) = row.items as Record<
        string,
        PlannerItem
      >;
    }
  }
  return next;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlannerData>(emptyData);
  const [ui, setUi] = useState<FilterState>(initialUi);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ required: false, ok: true });
  const [canWrite, setCanWrite] = useState(true);
  const [syncPending, setSyncPending] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [sheet, setSheet] = useState<ReactNode>(null);

  const dataRef = useRef(data);
  const pendingRef = useRef(0);
  const firstDoneRef = useRef(false);
  const queues = useRef<Record<string, Promise<unknown>>>({});
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiRef = useRef(ui);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    uiRef.current = ui;
  }, [ui]);

  const toast = (message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2600);
  };

  const closeSheet = () => setSheet(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (pendingRef.current > 0) return;
      try {
        const docs = await readAll();
        if (cancelled) return;
        setData(documentsToData(docs));
        setLastUpdated(new Date());
        setError(false);
        setReady(true);
        firstDoneRef.current = true;
      } catch {
        if (cancelled) return;
        if (!firstDoneRef.current) setError(true);
      }
    };

    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 6000);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    const onOnline = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void checkAuth()
      .then((result) => {
        if (cancelled) return;
        setAuth(result);
        setCanWrite(!result.required || result.ok);
      })
      .catch(() => {
        if (!cancelled) setCanWrite(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setUi((previous) => ({ ...previous, page: pageFromHash() }));
      setSheet(null);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const calc = useMemo(() => calculate(data), [data]);
  const fd = useMemo(() => fund(data), [data]);

  function schedule(key: string, job: () => Promise<unknown>) {
    pendingRef.current += 1;
    setSyncPending(pendingRef.current);
    queues.current[key] = (queues.current[key] || Promise.resolve())
      .then(job)
      .catch(() => {
        toast("Gagal menyimpan. Coba lagi.");
      })
      .finally(() => {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
        setSyncPending(pendingRef.current);
      });
  }

  function putItem(key: CollectionKey, item: PlannerItem) {
    setData((previous) => {
      const collection = previous[key] as Record<string, PlannerItem>;
      return {
        ...previous,
        [key]: { ...collection, [item.id]: item },
      } as PlannerData;
    });
    schedule(key, () => mergeDocument(key, { items: { [item.id]: item } }));
  }

  function putMany(key: CollectionKey, items: PlannerItem[]) {
    if (!items.length) return;
    const patch = Object.fromEntries(items.map((item) => [item.id, item]));
    setData((previous) => {
      const collection = previous[key] as Record<string, PlannerItem>;
      return {
        ...previous,
        [key]: { ...collection, ...patch },
      } as PlannerData;
    });
    schedule(key, () => mergeDocument(key, { items: patch }));
  }

  function delItem(key: CollectionKey, id: string) {
    const collection = dataRef.current[key] as Record<string, PlannerItem>;
    const next = { ...collection };
    delete next[id];
    setData((previous) => ({
      ...previous,
      [key]: next,
    }) as PlannerData);
    schedule(key, () => writeDocument(key, { items: next }));
  }

  function putSettings(patch: Partial<Settings>) {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, ...patch },
    }));
    schedule("settings", () => mergeDocument("settings", patch));
  }

  const nextOrder = (key: CollectionKey) => {
    const collection = dataRef.current[key] as Record<string, PlannerItem>;
    return (
      1 +
      Math.max(
        0,
        ...Object.values(collection).map((item) => Number(item.o) || 0),
      )
    );
  };

  function setFilter(group: keyof FilterState, key: string, value: string) {
    setUi((previous) => ({
      ...previous,
      [group]: {
        ...(previous[group] as Record<string, unknown>),
        [key]: value,
      },
    }));
  }

  function go(page: PageKey, set?: string) {
    setSheet(null);
    setUi((previous) => {
      const next = {
        ...previous,
        cl: { ...previous.cl, collapsed: { ...previous.cl.collapsed } },
        ag: { ...previous.ag },
        gf: { ...previous.gf },
        ac: { ...previous.ac },
        vd: { ...previous.vd },
        tm: { ...previous.tm },
        tb: { ...previous.tb },
        dk: { ...previous.dk },
        ct: { ...previous.ct },
        page,
      } as FilterState;
      (set || "")
        .split(";")
        .filter(Boolean)
        .forEach((pair) => {
          const split = pair.indexOf("=");
          if (split < 0) return;
          const [group, key] = pair.slice(0, split).split(".");
          const value = pair.slice(split + 1);
          const target = next[group as keyof FilterState];
          if (
            group !== "page" &&
            target &&
            typeof target === "object" &&
            key
          ) {
            (target as Record<string, unknown>)[key] = value;
          }
        });
      return next;
    });
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }

  const openForm = (
    type: FormType,
    item?: PlannerItem,
    extra: FormExtra = {},
  ) => {
    const spec = buildFormSpec(type, item, {
      data,
      calc,
      ui,
      setUi,
      putItem,
      putMany,
      delItem,
      putSettings,
      nextOrder,
      toast,
      closeSheet,
    }, extra);
    setSheet(
      <FormSheet
        key={`${type}-${item?.id || "new"}-${Date.now()}`}
        spec={spec}
        onClose={closeSheet}
        toast={toast}
        canWrite={canWrite}
      />,
    );
  };

  async function exportData() {
    const counts: Record<string, number> = {
      settings: Object.keys(data.settings).length,
    };
    const output: Record<string, unknown> = { settings: data.settings };
    for (const key of Object.keys(data) as (keyof PlannerData)[]) {
      if (key === "settings") continue;
      const items = data[key] as Record<string, unknown>;
      output[key] = { items };
      counts[key] = Object.keys(items).length;
    }
    try {
      await saveExport(output, counts);
      toast("Data diekspor");
    } catch (saveError) {
      toast(
        `Gagal ekspor: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
      );
    }
  }

  const value: PlannerContextValue = {
    data,
    calc,
    fund: fd,
    ui,
    ready,
    error,
    auth,
    canWrite,
    syncPending,
    lastUpdated,
    toastMessage,
    setUi,
    setFilter,
    go,
    toast,
    putItem,
    putMany,
    delItem,
    putSettings,
    nextOrder,
    openForm,
    openSheet: setSheet,
    closeSheet,
    exportData,
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
      {sheet}
      <div
        id="toast"
        className={toastMessage ? "on" : ""}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used inside PlannerProvider");
  }
  return context;
}

export type { FormValues };
