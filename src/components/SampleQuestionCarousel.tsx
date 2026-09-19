"use client";

import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "@/components/I18nProvider";

type Choice = {
  label: string;
  text: string;
  state: "default" | "correct" | "eliminated";
};

type SampleSlide = {
  exam: "SAT" | "TOEFL" | "DIM";
  labelKey: string;
  stem: string;
  choices: Choice[];
};

/** Exam content stays in the exam's language; only UI labels localize. */
const SLIDE_CONTENT: SampleSlide[] = [
  {
    exam: "SAT",
    labelKey: "sample.satLabel",
    stem: "The committee’s report was valued not for its length but for its ____ treatment of the evidence.",
    choices: [
      { label: "A", text: "perfunctory", state: "default" },
      { label: "B", text: "exhaustive", state: "correct" },
      { label: "C", text: "digressive", state: "eliminated" },
      { label: "D", text: "speculative", state: "default" },
    ],
  },
  {
    exam: "TOEFL",
    labelKey: "sample.toeflLabel",
    stem: "The author most likely mentions hydrothermal vents in order to",
    choices: [
      {
        label: "A",
        text: "contradict an earlier theory about ocean temperature",
        state: "default",
      },
      {
        label: "B",
        text: "illustrate a habitat that supports unusual adaptations",
        state: "correct",
      },
      {
        label: "C",
        text: "argue that sunlight is irrelevant to all marine life",
        state: "eliminated",
      },
      {
        label: "D",
        text: "minimize the role of chemical energy in ecosystems",
        state: "default",
      },
    ],
  },
  {
    exam: "DIM",
    labelKey: "sample.dimLabel",
    stem: "Hansı cümlədə feili bağlama işlənmişdir?",
    choices: [
      { label: "A", text: "Oxuduğu kitab onu dərindən düşündürdü.", state: "default" },
      { label: "B", text: "O, kitabı oxuyub dərslərinə başladı.", state: "correct" },
      { label: "C", text: "Oxumaq onun ən sevimli məşğuliyyətidir.", state: "eliminated" },
      { label: "D", text: "Oxuyan şagirdlər zalda əyləşmişdilər.", state: "default" },
    ],
  },
];

const SLIDE_DURATION_MS = 1000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.2 13.9 9.1 21 12 13.9 14.9 12 21.8 10.1 14.9 3 12 10.1 9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SampleQuestionCarousel() {
  const t = useTranslations();
  const [logical, setLogical] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [trackMotion, setTrackMotion] = useState(true);
  const [moving, setMoving] = useState(false);
  const [moveDir, setMoveDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const busyRef = useRef(false);
  const logicalRef = useRef(0);
  const snapTimer = useRef(0);

  const slides = useMemo(
    () =>
      SLIDE_CONTENT.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );

  const trackSlides = useMemo(
    () => [slides[2], ...slides, slides[0]],
    [slides]
  );

  const slide = slides[logical];

  const goTo = (to: number) => {
    if (busyRef.current || to === logicalRef.current) return;

    const from = logicalRef.current;
    const count = slides.length;
    const forward = (to - from + count) % count;
    const backward = (from - to + count) % count;
    const dir: 1 | -1 = forward <= backward ? 1 : -1;
    const steps = Math.min(forward, backward);
    const reduce = prefersReducedMotion();

    logicalRef.current = to;
    setLogical(to);
    setMoveDir(to > from ? 1 : -1);

    if (reduce) {
      setTrackMotion(false);
      setTrackIndex(to + 1);
      setMoving(false);
      return;
    }

    busyRef.current = true;
    setTrackMotion(true);
    setMoving(true);
    setTrackIndex((current) => current + dir * steps);

    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      setTrackMotion(false);
      setTrackIndex(to + 1);
      setMoving(false);
      busyRef.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTrackMotion(true);
        });
      });
    }, SLIDE_DURATION_MS);
  };

  useEffect(() => {
    return () => window.clearTimeout(snapTimer.current);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      goTo((logicalRef.current + 1) % SLIDE_CONTENT.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [paused]);

  if (!slide) return null;

  const coveredSlot = moving ? -1 : logical;

  return (
    <div
      className="hero-slide-carousel overflow-hidden rounded-2xl border border-card-border"
      data-exam={slide.exam}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`hero-slide-track flex ${trackMotion ? "" : "is-instant"}`}
        style={{ transform: `translateX(-${trackIndex * 100}%)` }}
      >
        {trackSlides.map((item, i) => (
          <div key={`${item.exam}-${i}`} className="hero-slide-panel w-full shrink-0">
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <p className="hero-slide-label inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <BookOpen className="h-4 w-4" aria-hidden />
                {item.label}
              </p>
              <span className="hero-slide-timer inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-heading text-xs font-semibold tracking-[0.04em]">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {t("sample.timer")}
              </span>
            </div>

            <p className="text-sm font-medium leading-relaxed text-foreground">
              {item.stem}
            </p>

            <div className="mt-3.5 space-y-2">
              {item.choices.map((choice) => (
                <div
                  key={choice.label}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
                    choice.state === "correct"
                      ? "hero-slide-choice-correct font-semibold text-foreground"
                      : choice.state === "eliminated"
                        ? "border-card-border bg-card text-muted line-through opacity-60"
                        : "border-card-border bg-card text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      choice.state === "correct"
                        ? "hero-slide-choice-mark text-white"
                        : "border-card-border text-muted"
                    }`}
                  >
                    {choice.label}
                  </span>
                  {choice.text}
                  {choice.state === "correct" && (
                    <CheckCircle2
                      className="hero-slide-choice-icon ml-auto h-4 w-4"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center border-t border-card-border px-6 py-2.5">
        <div className="hero-slide-star-rail">
          {slides.map((item, i) => (
            <button
              key={item.exam}
              type="button"
              aria-label={t("sample.showSample", { exam: item.exam })}
              aria-current={i === logical ? "true" : undefined}
              onClick={() => goTo(i)}
              className="hero-slide-star-slot"
            >
              <StarMark
                className={`hero-slide-star-idle h-3.5 w-3.5 ${
                  coveredSlot === i ? "is-covered" : ""
                }`}
              />
            </button>
          ))}
          <span
            className={`hero-slide-star-glider ${
              moving ? (moveDir === 1 ? "is-moving-right" : "is-moving-left") : ""
            }`}
            style={
              {
                "--hero-star-index": logical,
              } as CSSProperties
            }
            aria-hidden
          >
            <span className="hero-slide-star-trail" />
            <span className="hero-slide-star-glow" />
            <StarMark
              className={`hero-slide-star-active h-4 w-4 ${moving ? "" : "is-settled"}`}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
