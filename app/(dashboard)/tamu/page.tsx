"use client";

import { usePlanner } from "@/components/planner/data/planner-store";
import { nameA, nameB, sideOf } from "@/components/planner/data/calculations";
import type { Guest } from "@/components/planner/data/types";
import { GuestSummaryCards } from "./_components/guest-summary-cards";
import { GuestFilters } from "./_components/guest-filters";
import { GuestTableList } from "./_components/guest-table-list";

export default function TamuPage() {
  const { data, calc, ui, setFilter, canWrite, openForm, putItem } = usePlanner();

  const f = ui.tm;
  const guestList: Guest[] = Object.values(data.guests || {});

  const groups = Array.from(
    new Set(guestList.map((g) => g.group).filter(Boolean))
  ) as string[];

  const groom = nameA(data);
  const bride = nameB(data);

  const sides: Array<[string, string]> = [
    ["Semua", "Semua pihak"],
    [bride, `Pihak ${bride}`],
    [groom, `Pihak ${groom}`],
    ["-", "Belum diatur"],
  ];

  const q = (f.q || "").toLowerCase().trim();

  const filteredGuests = guestList.filter((g) => {
    if (f.grp !== "Semua" && g.group !== f.grp) return false;
    const s = sideOf(data, g);
    if (f.side === "-") {
      if (s) return false;
    } else if (f.side !== "Semua") {
      if (s !== f.side) return false;
    }
    if (f.rsvp === "Belum" && g.rsvp && g.rsvp !== "Belum") return false;
    if (f.rsvp !== "Semua" && f.rsvp !== "Belum" && g.rsvp !== f.rsvp) return false;
    if (q) {
      const match =
        (g.name || "").toLowerCase().includes(q) ||
        (g.table || "").toLowerCase().includes(q) ||
        (g.note || "").toLowerCase().includes(q) ||
        (g.wa || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const guestCountsByGroup: Record<string, number> = {};
  groups.forEach((g) => {
    guestCountsByGroup[g] = guestList.filter((x) => x.group === g).length;
  });

  const handleChangePax = (guest: Guest, delta: number) => {
    const cur = Number(guest.pax) || 1;
    const next = Math.max(1, cur + delta);
    putItem("guests", { ...guest, pax: next });
  };

  const handleChangeRsvp = (guest: Guest, rsvp: string) => {
    putItem("guests", {
      ...guest,
      rsvp,
      confirmed: rsvp === "Hadir" ? guest.confirmed || guest.pax : 0,
    });
  };

  return (
    <div>
      {/* Head */}
      <div className="head">
        <div>
          <h1>Tamu</h1>
          <p>Undangan, RSVP, dan kehadiran dihitung terpisah</p>
        </div>
        {canWrite && (
          <div className="acts2">
            <button
              type="button"
              className="btn pri"
              onClick={() => openForm("guest")}
            >
              Tambah tamu
            </button>
          </div>
        )}
      </div>

      {/* 5 Summary Tiles */}
      <GuestSummaryCards
        totalGuests={calc.gs.length}
        totalPax={calc.paxAll}
        sentCount={calc.sent}
        hadirCount={calc.hadir.length}
        tidakCount={calc.tidak.length}
        belumCount={calc.belum.length}
        hadirOrang={calc.hadirOrang}
        target={+(data.settings.target ?? 0)}
      />

      {/* Filters: Chips group, search, side select, rsvp seg */}
      <GuestFilters
        groups={groups}
        activeGroup={f.grp || "Semua"}
        onGroupChange={(grp) => setFilter("tm", "grp", grp)}
        guestCountsByGroup={guestCountsByGroup}
        query={f.q || ""}
        onQueryChange={(qVal) => setFilter("tm", "q", qVal)}
        sides={sides}
        activeSide={f.side || "Semua"}
        onSideChange={(sVal) => setFilter("tm", "side", sVal)}
        activeRsvp={f.rsvp || "Semua"}
        onRsvpChange={(rVal) => setFilter("tm", "rsvp", rVal)}
      />

      {/* Guest List */}
      <GuestTableList
        guests={filteredGuests}
        data={data}
        onEditGuest={(guest) => openForm("guest", guest)}
        onAddGuest={() => openForm("guest")}
        onChangePax={handleChangePax}
        onChangeRsvp={handleChangeRsvp}
        canWrite={canWrite}
      />
    </div>
  );
}
