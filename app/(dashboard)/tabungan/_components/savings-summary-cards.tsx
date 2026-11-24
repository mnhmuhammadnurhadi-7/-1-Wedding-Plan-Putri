"use client";

import { fmt, pct } from "@/components/planner/data/helpers";
import { Tile } from "@/components/planner/ui/tile";

interface SavingsSummaryCardsProps {
  totalAssets: number;
  targetBudget: number;
  monthlyDeposit: number;
}

export function SavingsSummaryCards({
  totalAssets,
  targetBudget,
  monthlyDeposit,
}: SavingsSummaryCardsProps) {
  const percentTarget = pct(totalAssets, targetBudget || 1);

  return (
    <div className="dash-hero">
      <Tile
        tone="ok"
        label="Total Dana Terkumpul"
        value={fmt(totalAssets)}
        sub={`${percentTarget}% dari target biaya pernikahan`}
        progress={percentTarget}
      />
      <Tile
        tone="acc"
        label="Target Anggaran"
        value={fmt(targetBudget)}
        sub={`Kekurangan: ${fmt(Math.max(0, targetBudget - totalAssets))}`}
      />
      <Tile
        tone="warn"
        label="Komitmen Setoran Bulanan"
        value={fmt(monthlyDeposit)}
        sub="Akumulasi patungan rutin kedua mempelai"
      />
    </div>
  );
}
