"use client";

import dynamic from "next/dynamic";

/**
 * recharts measures the DOM, so the chart is loaded client-side only — the
 * same treatment the exam question charts get in SatChart. `ssr: false` can
 * only be set from a client module, which is all this file exists for.
 */
export const AccuracyScatterLazy = dynamic(
  () =>
    import("@/components/sat/analytics/AccuracyScatter").then((m) => ({
      default: m.AccuracyScatter,
    })),
  {
    ssr: false,
    loading: () => <div className="anl-scatter anl-scatter--loading" aria-hidden />,
  }
);
