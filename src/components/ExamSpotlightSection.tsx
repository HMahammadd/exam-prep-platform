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
const TRANSITION_MS = 900;
const ENTER_MS = 520;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function CountUp({
  target,
  active,
  duration = 650,
}: {
  target: number;
  active: boolean;
  duration?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    setValue(0);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

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

export function ExamSpotlightSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("enter");
  const [starDegrees, setStarDegrees] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
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

  // New slide: content enters, then hold
  useEffect(() => {
    if (!inView) return;

    if (reduce.current) {
      setPhase("hold");
      return;
    }

    setPhase("enter");
    setCycleKey((key) => key + 1);

    const holdTimer = window.setTimeout(() => setPhase("hold"), ENTER_MS);

    return () => window.clearTimeout(holdTimer);
  }, [inView, index]);

  // Hold ~2.5s, then rotate star + exit content
  useEffect(() => {
    if (!inView || reduce.current) return;
    if (phase !== "hold") return;

    const exitTimer = window.setTimeout(() => {
      setPhase("exiting");
      setStarDegrees((deg) => deg + 180);
    }, DWELL_MS);

    return () => window.clearTimeout(exitTimer);
  }, [inView, phase, index]);

  // After transition, advance SAT → TOEFL → DİM → SAT
  useEffect(() => {
    if (!inView || reduce.current) return;
    if (phase !== "exiting") return;

    const advanceTimer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, TRANSITION_MS);

    return () => window.clearTimeout(advanceTimer);
  }, [inView, phase]);

  const contentLive = phase === "enter" || phase === "hold";

  return (
    <section
      id="exams"
      ref={sectionRef}
      className={`site-section exam-frame ${inView ? "is-inview" : ""}`}
      data-exam={active.id}
      data-phase={phase}
      aria-labelledby={labelId}
      style={{ "--frame-transition": `${TRANSITION_MS}ms` } as CSSProperties}
    >
      <div className="exam-frame-inner">
        <h2 id={labelId} className="sr-only">
          {t("exam.sat.name")}, {t("exam.toefl.name")}, {t("exam.dim.name")}
        </h2>

        <div className="exam-frame-stage">
          <TransitionStar
            degrees={starDegrees}
            blooming={phase === "exiting"}
          />

          <article
            key={`${active.id}-${cycleKey}`}
            className="exam-frame-slide"
            data-exam={active.id}
          >
            <p className="exam-frame-title">{t(active.nameKey)}</p>
            <ul className="exam-frame-metrics">
              {active.metrics.map((metric, metricIndex) => (
                <li
                  key={metric.id}
                  className="exam-frame-metric"
                  style={{ "--stagger": metricIndex } as CSSProperties}
                >
                  <span className="exam-frame-metric-label">
                    {t(metric.labelKey)}
                  </span>
                  <span className="exam-frame-metric-stat">
                    <CountUp target={metric.target} active={contentLive} />
                    <span className="exam-frame-metric-unit">
                      {t(metric.unitKey)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
