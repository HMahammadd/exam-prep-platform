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
  Headphones,
  History,
  LayoutGrid,
  Play,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/components/I18nProvider";

type FeatureId = "mistakes" | "vocab" | "navigator" | "listening" | "dim";

type FeatureDef = {
  id: FeatureId;
  titleKey: string;
  bodyKey: string;
  icon: LucideIcon;
  accent: string;
};

const FEATURES: FeatureDef[] = [
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
  {
    id: "listening",
    titleKey: "home.toeflListening",
    bodyKey: "home.toeflListeningBody",
    icon: Headphones,
    accent: "#d94f8a",
  },
  {
    id: "dim",
    titleKey: "home.dimPractice",
    bodyKey: "home.dimPracticeBody",
    icon: GraduationCap,
    accent: "#18a58b",
  },
];

const N = FEATURES.length;
const AUTOPLAY_MS = 4500;
const RESUME_MS = 2200;
const CLICK_RESUME_MS = 4800;
const DRAG_THRESHOLD_PX = 8;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const MISTAKE_ROWS = [
  { q: "18", skillKey: "home.deckDemo.mistakeSkillA" },
  { q: "24", skillKey: "home.deckDemo.mistakeSkillC" },
  { q: "31", skillKey: "home.deckDemo.mistakeSkillD" },
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

/** Shortest carousel path so goTo animates smoothly instead of jumping. */
function nearestPosition(current: number, targetIndex: number) {
  const rounded = Math.round(current);
  const currentIndex = clampIndex(rounded);
  let delta = targetIndex - currentIndex;
  if (delta > N / 2) delta -= N;
  if (delta < -N / 2) delta += N;
  return rounded + delta;
}

function cardIndexAtPoint(x: number, y: number, activeIdx: number) {
  const stack = document.elementsFromPoint(x, y);
  const seen: number[] = [];
  for (const node of stack) {
    const card = (node as Element).closest?.(
      "[data-deck-index]"
    ) as HTMLElement | null;
    if (!card) continue;
    const idx = Number(card.dataset.deckIndex);
    if (Number.isNaN(idx) || seen.includes(idx)) continue;
    seen.push(idx);
  }
  const side = seen.find((idx) => idx !== activeIdx);
  if (side !== undefined) return side;
  return seen[0] ?? null;
}

function useActivePhase(
  active: boolean,
  delaysCsv: string,
  reducedFinal = 3
) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    if (prefersReducedMotion()) {
      setPhase(reducedFinal);
      return;
    }
    const steps = delaysCsv.split(",").map((v) => Number(v.trim()));
    setPhase(0);
    const timers = steps.map((ms, i) =>
      window.setTimeout(() => setPhase(i + 1), ms)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, delaysCsv, reducedFinal]);

  return phase;
}

function MistakesPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const phase = useActivePhase(active, "280,620,980,1400", 4);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--mistakes is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.mistakesLabel")}</span>
        <span className="exam-deck-preview-badge is-on">
          {t("home.deckDemo.reviewAgainChip")}
        </span>
      </div>
      <ul className="exam-deck-mistake-list">
        {MISTAKE_ROWS.map((row, i) => (
          <li
            key={row.q}
            className={`exam-deck-mistake-item${i === 0 ? " is-pulse" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="exam-deck-mistake-q">
              {t("home.deckDemo.questionLabel", { n: row.q })}
            </span>
            <span className="exam-deck-mistake-skill">{t(row.skillKey)}</span>
          </li>
        ))}
      </ul>
      <p className="exam-deck-mistake-tagline">
        {t("home.deckDemo.mistakesTagline")}
      </p>
    </div>
  );
}

function VocabPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const phase = useActivePhase(active, "300,700,1100,1500", 4);
  const [count, setCount] = useState(110);

  useEffect(() => {
    if (!active) {
      setCount(110);
      return;
    }
    if (prefersReducedMotion()) {
      setCount(127);
      return;
    }
    setCount(110);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      setCount(Math.round(110 + (127 - 110) * (1 - Math.pow(1 - p, 2.4))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--vocab is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.vocabLabel")}</span>
        <span className="exam-deck-preview-pill">
          {t("home.deckDemo.vocabSavedCount", { n: count })}
        </span>
      </div>
      <p className="exam-deck-vocab-word">Meticulous</p>
      <p className="exam-deck-vocab-pos">{t("home.deckDemo.vocabPosAdj")}</p>
      <div className="exam-deck-vocab-meaning">
        <span>{t("home.deckDemo.vocabMeaningLabel")}</span>
        <p>{t("home.deckDemo.vocabMeaningA")}</p>
      </div>
      <span className="exam-deck-vocab-tag">
        {t("home.deckDemo.vocabSavedTag")}
      </span>
    </div>
  );
}

function NavigatorPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(0);
  const completed = new Set([1, 2, 3, 5, 6, 9, 11]);
  const marked = new Set([4, 10, 14]);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      setVisible(0);
      return;
    }
    if (prefersReducedMotion()) {
      setPhase(2);
      setVisible(15);
      return;
    }
    setPhase(0);
    setVisible(0);
    const timers: number[] = [];
    for (let i = 1; i <= 15; i += 1) {
      timers.push(window.setTimeout(() => setVisible(i), 80 + i * 55));
    }
    timers.push(window.setTimeout(() => setPhase(1), 1000));
    timers.push(window.setTimeout(() => setPhase(2), 1450));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active]);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--nav is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.navigatorLabel")}</span>
        <LayoutGrid className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </div>
      <div className="exam-deck-preview-grid" role="list">
        {Array.from({ length: 15 }, (_, i) => {
          const n = i + 1;
          const shown = n <= visible;
          const state = [
            shown ? "is-shown" : "",
            completed.has(n) ? "is-done" : "",
            marked.has(n) ? "is-flagged" : "",
            n === 7 && phase >= 1 ? "is-current" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <span
              key={n}
              className={`exam-deck-preview-cell ${state}`}
              role="listitem"
            >
              {n}
              {marked.has(n) && phase >= 2 ? <i aria-hidden /> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ListeningPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const phase = useActivePhase(active, "250,550,900,1250,1600", 5);
  const bars = [28, 46, 34, 62, 40, 72, 38, 58, 44, 66, 36, 52];

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--listening is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span className="exam-deck-listen-mode">
          <span className="is-active">{t("home.deckDemo.listenLecture")}</span>
          <span>{t("home.deckDemo.listenConversation")}</span>
        </span>
        <span className="exam-deck-preview-pill">03:42</span>
      </div>

      <div className="exam-deck-listen-player">
        <span className="exam-deck-listen-play" aria-hidden>
          <Play className="h-3 w-3" />
        </span>
        <div className="exam-deck-listen-wave" aria-hidden>
          {bars.map((h, i) => (
            <i
              key={i}
              style={{ "--h": `${h}%`, "--i": i } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <div className="exam-deck-preview-track exam-deck-listen-progress">
        <div className="exam-deck-preview-fill" />
      </div>

      <p className="exam-deck-listen-prompt">
        {t("home.deckDemo.listenPrompt")}
      </p>
      <div className="exam-deck-listen-tags">
        <span>{t("home.deckDemo.listenTagMain")}</span>
        <span>{t("home.deckDemo.listenTagDetail")}</span>
        <span>{t("home.deckDemo.listenTagInference")}</span>
      </div>
    </div>
  );
}

function DimPreview({ active }: { active: boolean }) {
  const t = useTranslations();
  const phase = useActivePhase(active, "280,700,1100,1550", 4);
  const [az, setAz] = useState(1200);
  const [math, setMath] = useState(1500);
  const [topics, setTopics] = useState(900);

  useEffect(() => {
    if (!active) {
      setAz(1200);
      setMath(1500);
      setTopics(900);
      return;
    }
    if (prefersReducedMotion()) {
      setAz(2000);
      setMath(2500);
      setTopics(1500);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1200);
      const e = 1 - Math.pow(1 - p, 2.5);
      setAz(Math.round(1200 + 800 * e));
      setMath(Math.round(1500 + 1000 * e));
      setTopics(Math.round(900 + 600 * e));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div
      className={`exam-deck-preview exam-deck-preview--dim is-phase-${phase}`}
    >
      <div className="exam-deck-preview-bar">
        <span>{t("home.deckDemo.dimLabel")}</span>
        <GraduationCap className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </div>
      <div className="exam-deck-dim-chips">
        <span>{t("home.deckDemo.dimChipAz")}</span>
        <span>{t("home.deckDemo.dimChipMath")}</span>
        <span>{t("home.deckDemo.dimChipMock")}</span>
      </div>
      <div className="exam-deck-dim-stats">
        <div className="is-focus">
          <strong>{az.toLocaleString()}+</strong>
          <span>{t("home.deckDemo.dimStatAz")}</span>
        </div>
        <div>
          <strong>{math.toLocaleString()}+</strong>
          <span>{t("home.deckDemo.dimStatMath")}</span>
        </div>
        <div>
          <strong>{topics.toLocaleString()}+</strong>
          <span>{t("home.deckDemo.dimStatTopics")}</span>
        </div>
      </div>
      <div className="exam-deck-dim-panel">
        <span>Riyaziyyat — funksiyalar</span>
        <p className="exam-deck-dim-q">
          f(x) = 2x − 1, g(x) = x² + 3 olduqda (f ∘ g)(2) ifadəsi neçəyə
          bərabərdir?
        </p>
        <ul className="exam-deck-dim-choices">
          <li>A) 5</li>
          <li>B) 9</li>
          <li className="is-correct">C) 13</li>
          <li>D) 11</li>
        </ul>
      </div>
    </div>
  );
}

function PreviewFor({ id, active }: { id: FeatureId; active: boolean }) {
  switch (id) {
    case "mistakes":
      return <MistakesPreview active={active} />;
    case "vocab":
      return <VocabPreview active={active} />;
    case "navigator":
      return <NavigatorPreview active={active} />;
    case "listening":
      return <ListeningPreview active={active} />;
    case "dim":
      return <DimPreview active={active} />;
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
    layout === "mobile" ? 48 : layout === "tablet" ? 70 : 92;
  const depth = layout === "mobile" ? 70 : layout === "tablet" ? 105 : 135;
  const scaleFalloff =
    layout === "mobile" ? 0.085 : layout === "tablet" ? 0.1 : 0.11;
  const scale = Math.max(0.7, 1 - abs * scaleFalloff);
  const opacity = Math.max(0.22, 1 - abs * 0.28);
  const x = d * spacing;
  const z = -abs * depth;

  return {
    opacity,
    // Depth comes from translateZ + scale only. No rotateY: a rotated plane
    // under the stage's perspective is what made side cards look trapezoidal.
    transform: `translate3d(${x}%, -50%, ${z}px) scale(${scale})`,
    zIndex: Math.round(40 - abs * 12),
    filter: abs > 0.55 ? "brightness(0.96)" : "none",
    // Keep all nearby cards clickable (including ±2 in a 5-card deck)
    pointerEvents: abs < 2.45 ? "auto" : "none",
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
    pointerId: number;
    startX: number;
    startY: number;
    startPos: number;
    dragging: boolean;
  } | null>(null);
  const resumeTimer = useRef(0);
  const positionRef = useRef(position);
  const activeIndex = clampIndex(Math.round(position));
  const mobile = layout === "mobile";

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

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

  const scheduleResume = useCallback((ms: number) => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), ms);
  }, []);

  const goTo = useCallback(
    (index: number, resumeMs = CLICK_RESUME_MS) => {
      const target = clampIndex(index);
      setPaused(true);
      setDragging(false);
      setPosition((current) => nearestPosition(current, target));
      scheduleResume(resumeMs);
    },
    [scheduleResume]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      goTo(activeIndex + dir, CLICK_RESUME_MS);
    },
    [activeIndex, goTo]
  );

  useEffect(() => {
    if (!entered || paused || dragging || reduced) return;
    const id = window.setInterval(() => {
      setPosition((p) => Math.round(p) + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [entered, paused, dragging, reduced]);

  useEffect(() => {
    if (dragging) return;
    if (position > N * 4 || position < -N) {
      setPosition(clampIndex(Math.round(position)));
    }
  }, [position, dragging]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    // Delay capture until drag threshold so clicks reach the correct card
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPos: positionRef.current,
      dragging: false,
    };
    setPaused(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (
      !drag.dragging &&
      Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX
    ) {
      drag.dragging = true;
      setDragging(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (!drag.dragging) return;
    const width = rootRef.current?.clientWidth || 360;
    const delta = -(dx / width) * (mobile ? 1.35 : 1.1);
    setPosition(drag.startPos + delta);
  };

  const endPointer = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const wasDrag = drag.dragging;
    const { clientX, clientY } = e;
    dragRef.current = null;

    if (wasDrag) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      setDragging(false);
      setPosition((pos) => Math.round(pos));
      scheduleResume(CLICK_RESUME_MS);
      return;
    }

    // Click: prefer the side card under the cursor (active card often overlaps)
    const idx = cardIndexAtPoint(clientX, clientY, activeIndex);
    if (idx !== null) {
      goTo(idx, CLICK_RESUME_MS);
      return;
    }
    scheduleResume(RESUME_MS);
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
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          if (!dragging && !dragRef.current) {
            scheduleResume(600);
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
                  transform: `translate3d(${d * (mobile ? 18 : 28)}%, -50%, ${-90 - Math.abs(d) * 40}px) scale(0.88)`,
                  zIndex: Math.round(20 - Math.abs(d) * 8),
                  pointerEvents: "none" as const,
                };
            return (
              <article
                key={feature.id}
                className={`exam-deck-card exam-deck-card--${feature.id}${isActive ? " is-active" : " is-side"}`}
                data-feature={feature.id}
                data-deck-index={i}
                style={
                  {
                    ...base,
                    transition: dragging
                      ? "none"
                      : `transform 720ms ${EASE}, opacity 720ms ${EASE}, filter 720ms ${EASE}, box-shadow 720ms ${EASE}`,
                    "--card-accent": feature.accent,
                  } as CSSProperties
                }
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

      <div
        className="exam-deck-dots"
        role="tablist"
        aria-label={t("home.realConditionsTitle")}
      >
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
