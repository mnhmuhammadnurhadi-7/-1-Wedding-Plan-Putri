"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAINTAB, PAGES } from "../data/constants";
import { usePlanner } from "../data/planner-store";
import { Icon } from "../ui/icon";
import { MoreSheet } from "../forms/more-sheet";

export function Tabbar() {
  const pathname = usePathname();
  const { go, openSheet, closeSheet } = usePlanner();

  const isMainActive = (page: string) =>
    pathname === `/${page}` || (pathname === "/" && page === "beranda");

  const hasExtraActive = !MAINTAB.some((page) => isMainActive(page));

  return (
    <nav className="tabbar" aria-label="Menu utama">
      {MAINTAB.map((page) => (
        <Link
          key={page}
          className="tab"
          href={`/${page}`}
          onClick={() => go(page)}
          aria-current={isMainActive(page) ? "page" : undefined}
        >
          <Icon name={PAGES[page].icon} />
          {PAGES[page].short || PAGES[page].label}
        </Link>
      ))}
      <button
        type="button"
        className="tab"
        aria-current={hasExtraActive ? "page" : undefined}
        onClick={() => openSheet(<MoreSheet onClose={closeSheet} />)}
      >
        <Icon name="more" />
        Lainnya
      </button>
    </nav>
  );
}
