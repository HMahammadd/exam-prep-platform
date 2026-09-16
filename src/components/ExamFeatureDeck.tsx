"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  BookOpen,
  Clock,
  History,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/components/I18nProvider";

type FeatureId = "timer" | "mistakes" | "vocab" | "navigator";

type FeatureDef = {
  id: FeatureId;
  titleKey: string;
  bodyKey: string;
  icon: LucideIcon;
  accent: string;
};

const FEATURES: FeatureDef[] = [
  {
    id: "timer",
    titleKey: "home.countdownTimer",
    bodyKey: "home.countdownTimerBody",
    icon: Clock,
    accent: "#3b82f6",
  },
  {
    id: "mistakes",
    titleKey: "home.reviewMistakes",
    bodyKey: "home.reviewMistakesBody",
    icon: History,
    accent: "#e07a5f",
  },
  {
    id: "vocab",
    titleKey: "home.vocabDeck",
    bodyKey: "home.vocabDeckBody",
    icon: BookOpen,
    accent: "#7c6cf0",
  },
  {
    id: "navigator",
    titleKey: "home.questionNavigator",
    bodyKey: "home.questionNavigatorBody",
    icon: LayoutGrid,
    accent: "#22a6c7",
  },
];

const N = FEATURES.length;
const AUTOPLAY_MS = 4200;
const RESUME_MS = 2200;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const MISTAKE_DEMOS = [
  {
    q: "18",
    skillKey: "home.deckDemo.mistakeSkillA",
    yoursKey: "home.deckDemo.mistakeYoursA",
    correctKey: "home.deckDemo.mistakeCorrectA",
  },
  {
    q: "23",
    skillKey: "home.deckDemo.mistakeSkillB",
    yoursKey: "home.deckDemo.mistakeYoursB",
    correctKey: "home.deckDemo.mistakeCorrectB",
  },
] as const;

const VOCAB_DEMOS = [
  {
    word: "Meticulous",
    posKey: "home.deckDemo.vocabPosAdj",
    meaningKey: "home.deckDemo.vocabMeaningA",
    exampleKey: "home.deckDemo.vocabExampleA",
  },
  {
    word: "Pragmatic",
    posKey: "home.deckDemo.vocabPosAdj",
    meaningKey: "home.deckDemo.vocabMeaningB",
    exampleKey: "home.deckDemo.vocabExampleB",
  },
] as const;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function wrapDelta(i: number, p: number, n: number) {
  let d = i - p;
  while (d > n / 2) d -= n;
  while (d < -n / 2) d += n;
  return d;
}

function clampIndex(i: number) {
  return ((i % N) + N) % N;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimerPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const [seconds, setSeconds] = useState(27 * 60 + 34);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 27 * 60 + 34));
    }, 1400);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="exam-deck-preview exam-deck-preview--timer">
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.moduleLabel")}</span>
        <span className="exam-deck-preview-pill">
          <Clock className="h-3 w-3" aria-hidden />
          {formatTime(seconds)}
        </span>
      </div>
      <p className="exam-deck-preview-kicker">{t("home.deckDemo.moduleName")}</p>
      <p className="exam-deck-preview-timer">{formatTime(seconds)}</p>
      <div className="exam-deck-preview-progress">
        <span>{t("home.deckDemo.questionsProgress")}</span>
        <div className="exam-deck-preview-track">
          <div className="exam-deck-preview-fill" style={{ width: "44%" }} />
        </div>
      </div>
    </div>
  );
}

function MistakesPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const demoIndexRef = useRef(0);
  const demo = MISTAKE_DEMOS[demoIndex] ?? MISTAKE_DEMOS[0];

  useEffect(() => {
    demoIndexRef.current = demoIndex;
  }, [demoIndex]);

  useEffect(() => {
    if (!active) {
      setDemoIndex(0);
      setPhase(0);
      return;
    }
    if (prefersReducedMotion()) {
      setPhase(3);
      return;
    }

    const timers: number[] = [];
    const runCycle = (startIndex: number) => {
      setDemoIndex(startIndex);
      setPhase(0);
      timers.push(window.setTimeout(() => setPhase(1), 450));
      timers.push(window.setTimeout(() => setPhase(2), 1100));
      timers.push(window.setTimeout(() => setPhase(3), 1750));
    };

    runCycle(0);
    const loop = window.setInterval(() => {
      const next = (demoIndexRef.current + 1) % MISTAKE_DEMOS.length;
      demoIndexRef.current = next;
      runCycle(next);
    }, 4000);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(loop);
    };
  }, [active]);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--mistakes is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.mistakesLabel")}</span>
        <History className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </div>
      <p className="exam-deck-preview-kicker">
        {t("home.deckDemo.questionLabel", { n: demo.q })}
        <span className="exam-deck-preview-skill">{t(demo.skillKey)}</span>
      </p>
      <div className="exam-deck-mistake-row is-yours">
        <span>{t("home.deckDemo.yourAnswer")}</span>
        <strong>{t(demo.yoursKey)}</strong>
      </div>
      <div className="exam-deck-mistake-row is-correct">
        <span>{t("home.deckDemo.correctAnswer")}</span>
        <strong>{t(demo.correctKey)}</strong>
      </div>
      <div className="exam-deck-mistake-footer">
        <span className="exam-deck-preview-badge is-on">
          {t("home.deckDemo.reviewCta")}
        </span>
        <span className="exam-deck-mistake-progress">
          {t("home.deckDemo.mistakesProgress")}
        </span>
      </div>
      <p className="exam-deck-mistake-tagline">
        {t("home.deckDemo.mistakesTagline")}
      </p>
    </div>
  );
}

function VocabPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const demo = VOCAB_DEMOS[demoIndex] ?? VOCAB_DEMOS[0];
  const demoIndexRef = useRef(0);

  useEffect(() => {
    demoIndexRef.current = demoIndex;
  }, [demoIndex]);

  useEffect(() => {
    if (!active) {
      setDemoIndex(0);
      setPhase(0);
      return;
    }
    if (prefersReducedMotion()) {
      setPhase(3);
      return;
    }

    const timers: number[] = [];
    const runCycle = (startIndex: number) => {
      setDemoIndex(startIndex);
      setPhase(0);
      timers.push(window.setTimeout(() => setPhase(1), 500));
      timers.push(window.setTimeout(() => setPhase(2), 1200));
      timers.push(window.setTimeout(() => setPhase(3), 1900));
    };

    runCycle(0);
    const loop = window.setInterval(() => {
      const next = (demoIndexRef.current + 1) % VOCAB_DEMOS.length;
      demoIndexRef.current = next;
      runCycle(next);
    }, 4000);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(loop);
    };
  }, [active]);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--vocab is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.vocabLabel")}</span>
        <span className="exam-deck-preview-pill">
          {t("home.deckDemo.vocabSaved")}
        </span>
      </div>
      <p className="exam-deck-vocab-word">{demo.word}</p>
      <p className="exam-deck-vocab-pos">{t(demo.posKey)}</p>
      <div className="exam-deck-vocab-meaning">
        <span>{t("home.deckDemo.vocabMeaningLabel")}</span>
        <p>{t(demo.meaningKey)}</p>
      </div>
      <p className="exam-deck-vocab-example">{t(demo.exampleKey)}</p>
      <div className="exam-deck-vocab-actions">
        <span className="is-know">{t("home.deckDemo.vocabKnow")}</span>
        <span className="is-again">{t("home.deckDemo.vocabAgain")}</span>
      </div>
    </div>
  );
}

function NavigatorPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const [current, setCurrent] = useState(7);
  const completed = new Set([1, 2, 3, 5, 6, 9, 11]);
  const marked = new Set([4, 10, 14]);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const path = [7, 8, 10, 12, 7];
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % path.length;
      setCurrent(path[step] ?? 7);
    }, 1100);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="exam-deck-preview exam-deck-preview--nav">
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.navigatorLabel")}</span>
        <LayoutGrid className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </div>
      <div className="exam-deck-preview-grid" role="list">
        {Array.from({ length: 15 }, (_, i) => {
          const n = i + 1;
          const state = [
            completed.has(n) ? "is-done" : "",
            marked.has(n) ? "is-flagged" : "",
            n === current ? "is-current" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <span key={n} className={`exam-deck-preview-cell ${state}`} role="listitem">
              {n}
              {marked.has(n) ? <i aria-hidden /> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PreviewFor({ id, active }: { id: FeatureId; active: boolean }) {
  switch (id) {
    case "timer":
      return <TimerPreview active={active} />;
    case "mistakes":
      return <MistakesPreview active={active} />;
    case "vocab":
      return <VocabPreview active={active} />;
    case "navigator":
      return <NavigatorPreview active={active} />;
  }
}

function cardStyle(
  d: number,
  reduced: boolean,
  layout: "mobile" | "tablet" | "desktop"
): CSSProperties {
  const abs = Math.abs(d);
  if (reduced) {
    return {
      opacity: abs < 0.5 ? 1 : 0,
      transform: `translate3d(${d * 28}%, 0, 0) scale(${abs < 0.5 ? 1 : 0.94})`,
      zIndex: Math.round(20 - abs * 10),
      pointerEvents: abs < 0.55 ? "auto" : "none",
    };
  }

  const spacing =
    layout === "mobile" ? 52 : layout === "tablet" ? 78 : 104;
  const depth = layout === "mobile" ? 75 : layout === "tablet" ? 110 : 145;
  const rot = layout === "mobile" ? 12 : layout === "tablet" ? 22 : 28;
  const scaleFalloff = layout === "mobile" ? 0.09 : layout === "tablet" ? 0.11 : 0.125;
  const scale = Math.max(0.74, 1 - abs * scaleFalloff);
  const opacity = Math.max(0.3, 1 - abs * 0.3);
  const x = d * spacing;
  const z = -abs * depth;
  const ry = -d * rot;

  return {
    opacity,
    transform: `translate3d(${x}%, -50%, ${z}px) rotateY(${ry}deg) scale(${scale})`,
    zIndex: Math.round(40 - abs * 12),
    filter: abs > 0.55 ? "brightness(0.96)" : "none",
    pointerEvents: abs < 1.15 ? "auto" : "none",
  };
}

export function ExamFeatureDeck() {
  const t = useTranslations();
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [layout, setLayout] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [reduced, setReduced] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startPos: number;
    moved: boolean;
  } | null>(null);
  const didDragRef = useRef(false);
  const resumeTimer = useRef(0);
  const activeIndex = clampIndex(Math.round(position));
  const mobile = layout === "mobile";

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const sync = () => {
      if (window.matchMedia("(max-width: 719px)").matches) {
        setLayout("mobile");
      } else if (window.matchMedia("(max-width: 1023px)").matches) {
        setLayout("tablet");
      } else {
        setLayout("desktop");
      }
    };
    sync();
    const mqMobile = window.matchMedia("(max-width: 719px)");
    const mqTablet = window.matchMedia("(max-width: 1023px)");
    mqMobile.addEventListener("change", sync);
    mqTablet.addEventListener("change", sync);
    return () => {
      mqMobile.removeEventListener("change", sync);
      mqTablet.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index: number, softPause = true) => {
    setPosition(clampIndex(index));
    if (softPause) {
      setPaused(true);
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_MS);
    }
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      goTo(activeIndex + dir);
    },
    [activeIndex, goTo]
  );

  useEffect(() => {
    if (!entered || paused || dragging || reduced) return;
    const id = window.setInterval(() => {
      setPosition((p) => {
        const next = Math.round(p) + 1;
        return next;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [entered, paused, dragging, reduced]);

  // Keep position in a manageable range without visual jump
  useEffect(() => {
    if (dragging) return;
    if (position > N * 4 || position < -N) {
      setPosition(clampIndex(Math.round(position)));
    }
  }, [position, dragging]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    didDragRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startPos: position,
      moved: false,
    };
    setDragging(true);
    setPaused(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 6) {
      drag.moved = true;
      didDragRef.current = true;
    }
    const width = rootRef.current?.clientWidth || 360;
    const delta = -(dx / width) * (mobile ? 1.35 : 1.1);
    setPosition(drag.startPos + delta);
  };

  const endDrag = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    const snapped = Math.round(position);
    setPosition(snapped);
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_MS);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(N - 1);
    }
  };

  const active = FEATURES[activeIndex] ?? FEATURES[0];

  return (
    <div
      ref={rootRef}
      className={`exam-deck${entered ? " is-entered" : ""}${dragging ? " is-dragging" : ""}${reduced ? " is-reduced" : ""}`}
      style={
        {
          "--deck-accent": active.accent,
          "--deck-ease": EASE,
        } as CSSProperties
      }
    >
      <div className="exam-deck-glow" aria-hidden />

      <div
        className="exam-deck-stage"
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          if (!dragging) {
            window.clearTimeout(resumeTimer.current);
            resumeTimer.current = window.setTimeout(() => setPaused(false), 600);
          }
        }}
      >
        <p id={labelId} className="sr-only">
          {t("home.realConditionsTitle")}
        </p>

        <div className="exam-deck-track" aria-live="polite">
          {FEATURES.map((feature, i) => {
            const d = wrapDelta(i, position, N);
            const isActive = Math.abs(d) < 0.5;
            const Icon = feature.icon;
            const base = entered
              ? cardStyle(d, reduced, layout)
              : {
                  opacity: 0,
                  transform: `translate3d(${d * (mobile ? 18 : 28)}%, -50%, ${-90 - Math.abs(d) * 40}px) rotateY(${-d * 18}deg) scale(0.88)`,
                  zIndex: Math.round(20 - Math.abs(d) * 8),
                  pointerEvents: "none" as const,
                };
            return (
              <article
                key={feature.id}
                className={`exam-deck-card exam-deck-card--${feature.id}${isActive ? " is-active" : ""}`}
                data-feature={feature.id}
                style={
                  {
                    ...base,
                    transition: dragging
                      ? "none"
                      : `transform 720ms ${EASE}, opacity 720ms ${EASE}, filter 720ms ${EASE}, box-shadow 720ms ${EASE}`,
                    "--card-accent": feature.accent,
                  } as CSSProperties
                }
                onClick={() => {
                  if (didDragRef.current) return;
                  if (!isActive) goTo(i);
                }}
                aria-hidden={!isActive}
              >
                <div className="exam-deck-card-face">
                  <header className="exam-deck-card-head">
                    <span className="exam-deck-card-icon" aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="exam-deck-card-title">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="exam-deck-card-body">
                        {t(feature.bodyKey)}
                      </p>
                    </div>
                  </header>
                  <PreviewFor id={feature.id} active={isActive && entered} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="exam-deck-dots" role="tablist" aria-label={t("home.realConditionsTitle")}>
        {FEATURES.map((feature, i) => (
          <button
            key={feature.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={`exam-deck-dot${i === activeIndex ? " is-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={t(feature.titleKey)}
          />
        ))}
      </div>
    </div>
  );
}
