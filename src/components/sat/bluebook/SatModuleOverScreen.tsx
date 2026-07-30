"use client";

import { useEffect } from "react";

type SatModuleOverScreenProps = {
  onContinue: () => void;
  /** How long to show this screen before auto-continuing */
  delayMs?: number;
};

export function SatModuleOverScreen({
  onContinue,
  delayMs = 3500,
}: SatModuleOverScreenProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onContinue, delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, onContinue]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <div className="flex max-w-xl flex-col items-center">
        <h1 className="text-[2rem] font-normal tracking-tight text-[#5b7fd4] sm:text-[2.5rem]">
          This Module Is Over
        </h1>

        <div className="mt-8 space-y-1 text-[1.05rem] leading-relaxed text-[#202124] sm:text-lg">
          <p>All your work has been saved.</p>
          <p>You&apos;ll move on automatically in just a moment.</p>
          <p>Do not refresh this page or quit the app.</p>
        </div>

        <div
          className="mt-24 flex items-center gap-2.5"
          role="status"
          aria-label="Loading next module"
        >
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="sat-loading-dot h-2.5 w-2.5 rounded-full bg-[#202124]"
              style={{ animationDelay: `${index * 0.28}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
