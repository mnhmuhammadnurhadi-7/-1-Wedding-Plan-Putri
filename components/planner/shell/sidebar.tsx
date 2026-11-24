"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUPS, PAGES } from "../data/constants";
import { nameA, nameB } from "../data/calculations";
import { usePlanner } from "../data/planner-store";
import { Icon } from "../ui/icon";

export function Sidebar() {
  const pathname = usePathname();
  const { data, go, exportData, syncPending, auth } = usePlanner();

  return (
    <aside className="side" id="side">
      <div className="brand">
        <b>
          {nameA(data)}
          <br />&amp; {nameB(data)}
        </b>
        <span>Wedding planner</span>
      </div>
      <nav className="nav" aria-label="Menu utama">
        {GROUPS.map((group) => (
          <div key={group.title || "utama"}>
            {group.title ? <h4>{group.title}</h4> : null}
            {group.pages.map((page) => {
              const active =
                pathname === `/${page}` ||
                (pathname === "/" && page === "beranda");
              return (
                <Link
                  key={page}
                  href={`/${page}`}
                  onClick={() => go(page)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={PAGES[page].icon} />
                  {PAGES[page].label}
                </Link>
              );
            })}
          </div>
        ))}
        <div>
          <h4>Sistem</h4>
          <Link
            href="/pengaturan"
            aria-current={pathname === "/pengaturan" ? "page" : undefined}
          >
            <Icon name="gear" />
            Pengaturan
          </Link>
        </div>
      </nav>
      <div className="side-foot">
        <button
          type="button"
          className="btn sm"
          onClick={() => void exportData()}
        >
          <Icon name="download" /> Export Data
        </button>
        <Link href="/login" className="btn sm">
          <Icon name="users" />{" "}
          {auth.session?.role
            ? `${auth.session.role}`
            : "Masuk / Ganti Akun"}
        </Link>
        <div className="sync">
          <span className={`dot ${syncPending ? "busy" : ""}`} />
          <span>{syncPending ? "Menyimpan..." : "Tersimpan"}</span>
        </div>
      </div>
    </aside>
  );
}
