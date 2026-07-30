"use client";

import type { ReactNode } from "react";
import type { SatChartId } from "@/types/sat-exam";
import { Exam1LokSabhaChart } from "./charts/Exam1LokSabhaChart";
import { Exam1FattyLiverTable } from "./charts/Exam1FattyLiverTable";
import { Exam2PigeonsChart } from "./charts/Exam2PigeonsChart";
import { Exam2FruitDrinksChart } from "./charts/Exam2FruitDrinksChart";
import { Exam2SocialExclusionTable } from "./charts/Exam2SocialExclusionTable";
import { Exam3PresidentsTable } from "./charts/Exam3PresidentsTable";
import { Exam3TourismChart } from "./charts/Exam3TourismChart";
import { Exam3HurricanesTable } from "./charts/Exam3HurricanesTable";
import { Exam3ShoppingChart } from "./charts/Exam3ShoppingChart";

const CHARTS: Record<SatChartId, () => ReactNode> = {
  "exam1-lok-sabha": () => <Exam1LokSabhaChart />,
  "exam1-fatty-liver": () => <Exam1FattyLiverTable />,
  "exam2-pigeons": () => <Exam2PigeonsChart />,
  "exam2-fruit-drinks": () => <Exam2FruitDrinksChart />,
  "exam2-social-exclusion": () => <Exam2SocialExclusionTable />,
  "exam3-presidents": () => <Exam3PresidentsTable />,
  "exam3-tourism": () => <Exam3TourismChart />,
  "exam3-hurricanes": () => <Exam3HurricanesTable />,
  "exam3-shopping": () => <Exam3ShoppingChart />,
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
      {Chart()}
    </div>
  );
}
