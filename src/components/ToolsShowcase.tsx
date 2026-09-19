"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "@/components/I18nProvider";

type ToolAccent = "blue" | "teal" | "violet" | "aqua";

type ToolBlock = {
  id: "courses" | "desmos" | "explanations" | "conditions" | "video" | "tutor";
  accent: ToolAccent;
  titleKey: string;
  highlightKey: string;
  bodyKey: string;
  /** Real product footage; omitted where the ZIP has no matching capture. */
  video?: string;
  poster?: string;
  /** Not shipped yet — renders a "Soon" badge on the frame. */
  soon?: boolean;
};

const BLOCKS: ToolBlock[] = [
  {
    id: "courses",
    accent: "blue",
    titleKey: "tools.coursesTitle",
    highlightKey: "tools.coursesHighlight",
    bodyKey: "tools.coursesBody",
    video: "/demo/videos/02-choose-exam.mp4",
    poster: "/demo/posters/02-choose-exam.jpg",
  },
  {
    id: "desmos",
    accent: "teal",
    titleKey: "tools.desmosTitle",
    highlightKey: "tools.desmosHighlight",
    bodyKey: "tools.desmosBody",
  },
  {
    id: "explanations",
    accent: "violet",
    titleKey: "tools.explanationsTitle",
    highlightKey: "tools.explanationsHighlight",
    bodyKey: "tools.explanationsBody",
    video: "/demo/videos/04-review-improve.mp4",
    poster: "/demo/posters/04-review-improve.jpg",
  },
  {
    id: "conditions",
    accent: "aqua",
    titleKey: "tools.conditionsTitle",
    highlightKey: "tools.conditionsHighlight",
    bodyKey: "tools.conditionsBody",
    video: "/demo/videos/03-practice.mp4",
    poster: "/demo/posters/03-practice.jpg",
  },
  {
    id: "video",
    accent: "violet",
    titleKey: "tools.videoTitle",
    highlightKey: "tools.videoHighlight",
    bodyKey: "tools.videoBody",
    soon: true,
  },
  {
    id: "tutor",
    accent: "blue",
    titleKey: "tools.tutorTitle",
    highlightKey: "tools.tutorHighlight",
    bodyKey: "tools.tutorBody",
    soon: true,
  },
];

const ROCKETS = [
  { id: "r1", className: "tools-rocket--a" },
  { id: "r2", className: "tools-rocket--b" },
  { id: "r3", className: "tools-rocket--c" },
];

const STARS = [
  { top: "8%", left: "6%", delay: "0s", size: 3 },
  { top: "18%", left: "88%", delay: "1.4s", size: 2 },
  { top: "34%", left: "14%", delay: "2.1s", size: 2 },
  { top: "46%", left: "78%", delay: "0.7s", size: 3 },
  { top: "62%", left: "9%", delay: "2.8s", size: 2 },
  { top: "74%", left: "92%", delay: "1.1s", size: 3 },
  { top: "88%", left: "22%", delay: "3.2s", size: 2 },
  { top: "27%", left: "52%", delay: "1.9s", size: 2 },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Plays only while visible; pauses fully offscreen so idle clips cost nothing. */
function ProductVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="tools-media-video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
    />
  );
}

/**
 * No graphing capture exists in the supplied assets, so this block is drawn
 * from the app's own tokens: a practice question beside a graphing panel that
 * plots both sides of the equation and marks where they meet. Deliberately
 * unbranded — third-party calculator marks belong to their owner.
 */
function DesmosFrame() {
  const t = useTranslations();

  const choices = [
    { key: "A", value: "−0.5", correct: true },
    { key: "B", value: "−0.75", correct: false },
    { key: "C", value: "1.5", correct: false },
    { key: "D", value: "2.5", correct: false },
  ];

  return (
    <div className="tools-desmos">
      <div className="tools-desmos-bar">
        <span className="tools-desmos-chip">{t("tools.desmosTopic")}</span>
        <span className="tools-desmos-label">{t("tools.desmosFrameLabel")}</span>
      </div>

      <div className="tools-desmos-body">
        <div className="tools-desmos-problem">
          <span className="tools-desmos-eyebrow">{t("tools.desmosProblem")}</span>

          <p className="tools-desmos-equation" aria-hidden>
            <span className="tools-frac">
              <span className="tools-frac-top">2x + 5</span>
              <span className="tools-frac-bot">3 − x</span>
            </span>
            <span className="tools-frac-eq">=</span>
            <span className="tools-frac">
              <span className="tools-frac-top">14</span>
              <span className="tools-frac-bot">15</span>
            </span>
          </p>

          <ul className="tools-desmos-choices" aria-hidden>
            {choices.map((choice) => (
              <li
                key={choice.key}
                className={`tools-desmos-choice${choice.correct ? " is-correct" : ""}`}
              >
                <span className="tools-desmos-choice-key">{choice.key}</span>
                <span className="tools-desmos-choice-value">{choice.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tools-desmos-graph" aria-hidden>
          <div className="tools-desmos-rows">
            <span className="tools-desmos-row">
              <i className="tools-desmos-swatch tools-desmos-swatch--curve" />
              y = (2x + 5) / (3 − x)
            </span>
            <span className="tools-desmos-row">
              <i className="tools-desmos-swatch tools-desmos-swatch--line" />
              y = 14 / 15
              <b className="tools-desmos-eval">0.9333</b>
            </span>
          </div>

          <svg viewBox="0 0 220 132" className="tools-desmos-svg">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 22}
                x2="220"
                y2={i * 22}
                className="tools-desmos-grid"
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <line
                key={`v${i}`}
                x1={i * 22}
                y1="0"
                x2={i * 22}
                y2="132"
                className="tools-desmos-grid"
              />
            ))}

            <line x1="0" y1="88" x2="220" y2="88" className="tools-desmos-axis" />
            <line x1="132" y1="0" x2="132" y2="132" className="tools-desmos-axis" />

            {/* y = 14/15 — just under 1, so it sits slightly above the x-axis */}
            <line x1="0" y1="66" x2="220" y2="66" className="tools-desmos-line" />

            {/* y = (2x+5)/(3−x), left branch rising toward the asymptote at x = 3 */}
            <path
              d="M2 104 C 48 100, 86 92, 112 72 C 126 60, 134 34, 138 2"
              className="tools-desmos-curve"
            />

            {/* the two graphs meet at x = −0.5 */}
            <circle cx="121" cy="66" r="3.6" className="tools-desmos-root" />
          </svg>
        </div>
      </div>
    </div>
  );
}


/**
 * Video lessons — original scene, no stock art: an abstract presenter beside a
 * board whose lines write themselves in. Pure CSS keyframes.
 */
function VideoLessonFrame() {
  const t = useTranslations();

  return (
    <div className="tools-lesson" aria-hidden>
      <div className="tools-lesson-board">
        <div className="tools-lesson-board-head">
          <span className="tools-lesson-topic">{t("tools.boardTopic")}</span>
          <span className="tools-lesson-dots">
            <i />
            <i />
            <i />
          </span>
        </div>

        <p className="tools-lesson-eq">
          <span className="tools-lesson-write">x² − 5x + 6 = 0</span>
        </p>

        <p className="tools-lesson-eq tools-lesson-eq--2">
          <span className="tools-lesson-write">(x − 2)(x − 3) = 0</span>
        </p>

        <p className="tools-lesson-answer">
          <span className="tools-lesson-write">x = 2, x = 3</span>
          <span className="tools-lesson-underline" />
        </p>

        <span className="tools-lesson-step">{t("tools.boardStep")}</span>
      </div>

      <div className="tools-lesson-teacher">
        <span className="tools-lesson-head" />
        <span className="tools-lesson-body" />
        <span className="tools-lesson-arm" />
      </div>
    </div>
  );
}

/** Tutor support — chat thread that types and replies on a loop. */
function TutorFrame() {
  const t = useTranslations();

  return (
    <div className="tools-tutor" aria-hidden>
      <div className="tools-tutor-head">
        <span className="tools-tutor-avatar tools-tutor-avatar--tutor">
          <span className="tools-tutor-pulse" />
        </span>
        <span className="tools-tutor-name">{t("tools.tutorName")}</span>
        <span className="tools-tutor-online" />
      </div>

      <div className="tools-tutor-thread">
        <span className="tools-tutor-bubble tools-tutor-bubble--them">
          {t("tools.tutorMsg")}
        </span>
        <span className="tools-tutor-bubble tools-tutor-bubble--me">
          {t("tools.tutorStudent")}
        </span>
        <span className="tools-tutor-bubble tools-tutor-bubble--them tools-tutor-bubble--3">
          {t("tools.tutorReply")}
        </span>
        <span className="tools-tutor-typing">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

function ToolsBlock({ block, index }: { block: ToolBlock; index: number }) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setGlow({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    },
    []
  );

  return (
    <div
      ref={ref}
      className={`tools-block tools-block--${
        index % 2 === 0 ? "text-first" : "media-first"
      }${inView ? " is-inview" : ""}`}
      data-accent={block.accent}
    >
      <div className="tools-copy">
        <h3 className="tools-copy-title">
          {t(block.titleKey)}{" "}
          <span className="tools-copy-highlight">{t(block.highlightKey)}</span>
        </h3>
        <p className="tools-copy-body">{t(block.bodyKey)}</p>
      </div>

      <div
        className="tools-media"
        style={
          { "--tools-mx": `${glow.x}%`, "--tools-my": `${glow.y}%` } as CSSProperties
        }
        onPointerMove={onPointerMove}
      >
        <div className="tools-media-frame">
          {block.soon ? <span className="tools-soon">{t("tools.soon")}</span> : null}

          {block.video && block.poster ? (
            <ProductVideo src={block.video} poster={block.poster} />
          ) : block.id === "video" ? (
            <VideoLessonFrame />
          ) : block.id === "tutor" ? (
            <TutorFrame />
          ) : (
            <DesmosFrame />
          )}
        </div>
      </div>
    </div>
  );
}

export function ToolsShowcase() {
  const t = useTranslations();

  return (
    <section className="site-section tools-showcase">
      <div className="tools-decor" aria-hidden>
        {STARS.map((star) => (
          <span
            key={`${star.top}-${star.left}`}
            className="tools-star"
            style={
              {
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
              } as CSSProperties
            }
          />
        ))}

        {ROCKETS.map((rocket) => (
          <span key={rocket.id} className={`tools-rocket ${rocket.className}`}>
            <svg viewBox="0 0 24 24" fill="none" className="tools-rocket-svg">
              <path
                d="M12 2c3.2 2.1 5 5.6 5 9.4l-2.2 2.2H9.2L7 11.4C7 7.6 8.8 4.1 12 2Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M9.2 13.6 7.4 18l2.6-1.2M14.8 13.6 16.6 18 14 16.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9.4" r="1.6" className="tools-rocket-window" />
            </svg>
          </span>
        ))}
      </div>

      <div className="tools-inner mx-auto max-w-6xl px-5 sm:px-6">
        <div className="tools-head">
          <h2 className="tools-title">
            <span className="tools-title-line">{t("tools.headingLine1")}</span>
            <span className="tools-title-line">
              <span className="tools-title-accent">{t("tools.headingLine2")}</span>
            </span>
          </h2>
        </div>

        <div className="tools-blocks">
          {BLOCKS.map((block, index) => (
            <ToolsBlock key={block.id} block={block} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
