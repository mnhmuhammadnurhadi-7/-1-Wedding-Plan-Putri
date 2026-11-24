export const DOC_IDS = [
  "settings",
  "checklist",
  "budget",
  "expenses",
  "vendors",
  "guests",
  "savings",
  "docs",
  "notes",
  "gifts",
  "events",
  "cats",
  "invest",
] as const;

export type DocId = (typeof DOC_IDS)[number];

export type StoredDocument = {
  data: unknown;
  updated_at: string;
};

export function isDocId(value: string): value is DocId {
  return (DOC_IDS as readonly string[]).includes(value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
