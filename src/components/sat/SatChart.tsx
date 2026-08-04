"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SatChartId } from "@/types/sat-exam";

function chartLoading() {
  return (
    <div
      className="flex h-48 items-center justify-center text-sm text-slate-400"
      aria-hidden
    >
      Loading chart…
    </div>
  );
}

function loadChart(
  loader: () => Promise<{ default: ComponentType }>
) {
  return dynamic(loader, {
    ssr: false,
    loading: chartLoading,
  });
}

const CHARTS: Record<SatChartId, ComponentType> = {
  "exam1-lok-sabha": loadChart(() =>
    import("./charts/Exam1LokSabhaChart").then((m) => ({
      default: m.Exam1LokSabhaChart,
    }))
  ),
  "exam1-fatty-liver": loadChart(() =>
    import("./charts/Exam1FattyLiverTable").then((m) => ({
      default: m.Exam1FattyLiverTable,
    }))
  ),
  "exam2-pigeons": loadChart(() =>
    import("./charts/Exam2PigeonsChart").then((m) => ({
      default: m.Exam2PigeonsChart,
    }))
  ),
  "exam2-fruit-drinks": loadChart(() =>
    import("./charts/Exam2FruitDrinksChart").then((m) => ({
      default: m.Exam2FruitDrinksChart,
    }))
  ),
  "exam2-social-exclusion": loadChart(() =>
    import("./charts/Exam2SocialExclusionTable").then((m) => ({
      default: m.Exam2SocialExclusionTable,
    }))
  ),
  "exam3-presidents": loadChart(() =>
    import("./charts/Exam3PresidentsTable").then((m) => ({
      default: m.Exam3PresidentsTable,
    }))
  ),
  "exam3-tourism": loadChart(() =>
    import("./charts/Exam3TourismChart").then((m) => ({
      default: m.Exam3TourismChart,
    }))
  ),
  "exam3-hurricanes": loadChart(() =>
    import("./charts/Exam3HurricanesTable").then((m) => ({
      default: m.Exam3HurricanesTable,
    }))
  ),
  "exam3-shopping": loadChart(() =>
    import("./charts/Exam3ShoppingChart").then((m) => ({
      default: m.Exam3ShoppingChart,
    }))
  ),
};

type SatChartProps = {
  chartId: SatChartId;
};

export function SatChart({ chartId }: SatChartProps) {
  const Chart = CHARTS[chartId];
  if (!Chart) {
    return null;
  }

  return (
    <div className="mt-4 w-full max-w-xl overflow-hidden rounded border border-[#e5e7eb] bg-white p-3">
      <Chart />
    </div>
  );
}
