"use client";

import { PAGES } from "../data/constants";
import { usePlanner } from "../data/planner-store";
import type { PageKey } from "../data/types";
import { GoLink } from "../ui/go-link";
import { Icon } from "../ui/icon";
import { Sheet } from "../ui/sheet";

const EXTRA_PAGES: PageKey[] = [
  "mahar",
  "acara",
  "dokumen",
  "catatan",
  "tabungan",
  "vendor",
];

export function MoreSheet({ onClose }: { onClose: () => void }) {
  const { openForm, exportData } = usePlanner();
  return (
    <Sheet onClose={onClose}>
      <h2>Menu lainnya</h2>
      <div className="moregrid">
        {EXTRA_PAGES.map((page) => (
          <GoLink key={page} page={page}>
            <Icon name={PAGES[page].icon} />
            {PAGES[page].label}
          </GoLink>
        ))}
        <button
          type="button"
          className="nav-link"
          onClick={() => {
            onClose();
            void exportData();
          }}
        >
          <Icon name="download" />
          Export Data
        </button>
        <button
          type="button"
          className="nav-link"
          onClick={() => {
            onClose();
            openForm("settings");
          }}
        >
          <Icon name="gear" />
          Pengaturan
        </button>
      </div>
      <div className="acts">
        <button type="button" className="btn" onClick={onClose}>
          Tutup
        </button>
      </div>
    </Sheet>
  );
}
