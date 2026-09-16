"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslations } from "@/components/I18nProvider";

type ExamSlideId = "sat" | "toefl" | "dim";

type MetricDef = {
  id: string;
  labelKey: string;
  unitKey: string;
  target: number;
};

type SlideDef = {
  id: ExamSlideId;
  nameKey: string;
  metrics: MetricDef[];
};

type Phase = "enter" | "hold" | "exiting";

const SLIDES: SlideDef[] = [
  {
    id: "sat",
    nameKey: "exam.sat.name",
    metrics: [
      {
        id: "rw",
        labelKey: "exam.sat.features.readingWriting",
        unitKey: "exam.sat.features.readingWritingUnit",
        target: 5000,
      },
      {
        id: "exams",
        labelKey: "exam.sat.features.practiceExams",
        unitKey: "exam.sat.features.practiceExamsUnit",
        target: 30,
      },
      {
        id: "math",
        labelKey: "exam.sat.features.math",
        unitKey: "exam.sat.features.mathUnit",
        target: 3000,
      },
    ],
  },
  {
    id: "toefl",
    nameKey: "exam.toefl.name",
    metrics: [
      {
        id: "reading",
        labelKey: "exam.toefl.features.reading",
        unitKey: "exam.toefl.features.readingUnit",
        target: 2500,
      },
      {
        id: "listening",
        labelKey: "exam.toefl.features.listening",
        unitKey: "exam.toefl.features.listeningUnit",
        target: 2000,
      },
      {
        id: "vocab",
        labelKey: "exam.toefl.features.vocab",
        unitKey: "exam.toefl.features.vocabUnit",
        target: 1500,
      },
    ],
  },
  {
    id: "dim",
    nameKey: "exam.dim.name",
    metrics: [
      {
        id: "az",
        labelKey: "exam.dim.features.azerbaijani",
        unitKey: "exam.dim.features.azerbaijaniUnit",
        target: 2000,
      },
      {
        id: "math",
        labelKey: "exam.dim.features.math",
        unitKey: "exam.dim.features.mathUnit",
        target: 2500,
      },
      {
        id: "topics",
        labelKey: "exam.dim.features.topics",
        unitKey: "exam.dim.features.topicsUnit",
        target: 1500,
      },
    ],
  },
];

const DWELL_MS = 2500;
const FADE_MS = 700;
const OVERLAP_MS = 220;
const ENTER_MS = 700;
const COUNT_MS = 1050;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function CountUp({
  target,
  play,
  delay = 0,
  duration = COUNT_MS,
}: {
  target: number;
  play: boolean;
  delay?: number;
  duration?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!play) return;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startAt = 0;
    setValue(0);

    const startTimer = window.setTimeout(() => {
      startAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 2.6);
        setValue(Math.round(target * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else setValue(target);
      };
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(frame);
    };
  }, [play, delay, duration, target]);

  return (
    <span className="exam-frame-num">
      {value.toLocaleString()}
      <span className="exam-frame-plus">+</span>
    </span>
  );
}

function TransitionStar({
  degrees,
  blooming,
}: {
  degrees: number;
  blooming: boolean;
}) {
  return (
    <div
      className={`exam-frame-star${blooming ? " is-blooming" : ""}`}
      aria-hidden
    >
      <span className="exam-frame-star-glow" />
      <svg
        className="exam-frame-star-svg"
        viewBox="0 0 64 64"
        fill="none"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <path
          d="M32 5 37.6 24.4 58 30 37.6 35.6 32 55 26.4 35.6 6 30 26.4 24.4Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function ExamFrameBackdrop() {
  return (
    <div className="exam-frame-fx" aria-hidden>
      <div className="exam-frame-fx-void" />
      <div className="exam-frame-fx-stars" />
      <div className="exam-frame-fx-curtain exam-frame-fx-curtain--left" />
      <div className="exam-frame-fx-curtain exam-frame-fx-curtain--right" />
      <div className="exam-frame-fx-bloom" />
    </div>
  );
}

function ExamSlide({
  slide,
  mode,
  counting,
}: {
  slide: SlideDef;
  mode: "enter" | "hold" | "leaving";
  counting: boolean;
}) {
  const t = useTranslations();

  return (
    <article
      className={`exam-frame-slide is-${mode}`}
      data-exam={slide.id}
      aria-hidden={mode === "leaving"}
    >
      <div className="exam-frame-title-slot">
        <p className="exam-frame-title">{t(slide.nameKey)}</p>
      </div>
      <ul className="exam-frame-metrics">
        {slide.metrics.map((metric, metricIndex) => (
          <li
            key={metric.id}
            className="exam-frame-metric"
            style={{ "--stagger": metricIndex } as CSSProperties}
          >
            <span className="exam-frame-metric-label">
              {t(metric.labelKey)}
            </span>
            <span className="exam-frame-metric-stat">
              <CountUp
                target={metric.target}
                play={counting}
                delay={180 + metricIndex * 140}
              />
              <span className="exam-frame-metric-unit">
                {t(metric.unitKey)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ExamSpotlightSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("enter");
  const [starDegrees, setStarDegrees] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [outgoing, setOutgoing] = useState<{
    index: number;
    key: number;
  } | null>(null);
  const labelId = useId();
  const active = SLIDES[index] ?? SLIDES[0];
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // enter → hold
  useEffect(() => {
    if (!inView) return;
    if (reduce.current) {
      setPhase("hold");
      return;
    }
    if (phase !== "enter") return;

    const holdTimer = window.setTimeout(() => setPhase("hold"), ENTER_MS);
    return () => window.clearTimeout(holdTimer);
  }, [inView, phase, cycleKey]);

  // hold → begin exit + capture outgoing
  useEffect(() => {
    if (!inView || reduce.current) return;
    if (phase !== "hold") return;

    const exitTimer = window.setTimeout(() => {
      setOutgoing({ index, key: cycleKey });
      setPhase("exiting");
      setStarDegrees((deg) => deg + 180);
    }, DWELL_MS);

    return () => window.clearTimeout(exitTimer);
  }, [inView, phase, index, cycleKey]);

  // Crossfade timeline: overlap swap, then drop outgoing after full fade
  useEffect(() => {
    if (!inView || reduce.current || !outgoing) return;

    const swapTimer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
      setCycleKey((key) => key + 1);
      setPhase("enter");
    }, OVERLAP_MS);

    const clearTimer = window.setTimeout(() => {
      setOutgoing(null);
    }, FADE_MS);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(clearTimer);
    };
  }, [inView, outgoing]);

  const outgoingSlide =
    outgoing != null ? (SLIDES[outgoing.index] ?? SLIDES[0]) : null;
  // Same React key as the prior active slide so opacity 1→0 transitions on the DOM node
  const soloLeaving =
    outgoing != null &&
    outgoing.index === index &&
    outgoing.key === cycleKey;
  const counting = phase === "enter" || phase === "hold";

  return (
    <section
      id="exams"
      ref={sectionRef}
      className={`site-section exam-frame ${inView ? "is-inview" : ""}`}
      data-exam={active.id}
      data-phase={phase}
      aria-labelledby={labelId}
      style={{ "--frame-fade": `${FADE_MS}ms` } as CSSProperties}
    >
      <ExamFrameBackdrop />

      <div className="exam-frame-inner">
        <h2 id={labelId} className="sr-only">
          {t("exam.sat.name")}, {t("exam.toefl.name")}, {t("exam.dim.name")}
        </h2>

        <div className="exam-frame-stage">
          <TransitionStar
            degrees={starDegrees}
            blooming={outgoing !== null}
          />

          <div className="exam-frame-crossfade">
            {outgoingSlide && outgoing ? (
              <ExamSlide
                key={`slide-${outgoingSlide.id}-${outgoing.key}`}
                slide={outgoingSlide}
                mode="leaving"
                counting={false}
              />
            ) : null}

            {!soloLeaving ? (
              <ExamSlide
                key={`slide-${active.id}-${cycleKey}`}
                slide={active}
                mode={phase === "hold" ? "hold" : "enter"}
                counting={counting}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
