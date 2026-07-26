"use client";

import {
  Accessibility,
  BookOpenCheck,
  Clock3,
  LockOpen,
} from "lucide-react";

type SatInstructionsScreenProps = {
  onBack: () => void;
  onNext: () => void;
};

const ITEMS = [
  {
    title: "Timing",
    body: "Practice tests are timed, but you can pause them. To continue on another device, you have to start over. We delete incomplete practice tests after 90 days.",
    Icon: Clock3,
  },
  {
    title: "Scores",
    body: "When you finish the practice test, go to My Practice to see your scores and get personalized study tips.",
    Icon: BookOpenCheck,
  },
  {
    title: "Assistive Technology (AT)",
    body: "Be sure to practice with any AT you use for testing. If you configure your AT settings here, you may need to repeat this step on test day.",
    Icon: Accessibility,
  },
  {
    title: "No Device Lock",
    body: "We don't lock your device during practice. On test day, you'll be blocked from using other programs or apps.",
    Icon: LockOpen,
  },
] as const;

export function SatInstructionsScreen({
  onBack,
  onNext,
}: SatInstructionsScreenProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] text-[#1a2b4c]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          Practice Test
        </h1>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          <ul className="space-y-8">
            {ITEMS.map(({ title, body, Icon }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8eaed] text-[#5f6368]">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#202124]">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#5f6368]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-[#3b5998] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#334e86]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-[#3b5998] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#334e86]"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
