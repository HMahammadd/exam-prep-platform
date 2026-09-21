import type { ReactNode } from "react";

/**
 * Header and auth are handled once by the dashboard shell layout above; this
 * only keeps the lessons column width consistent with the other sections.
 */
export default function SatLessonsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="mx-auto flex w-full max-w-7xl flex-1">{children}</div>;
}
