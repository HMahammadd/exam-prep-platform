"use client";

import {
  BookMarked,
  ClipboardCheck,
  Lightbulb,
  Library,
  RotateCcw,
  Sigma,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "@/components/I18nProvider";

type FeatureVariant = "accent" | "neutral" | "navy" | "dim";

type FeatureCardDef = {
  id:
    | "books"
    | "practice"
    | "progress"
    | "explanations"
    | "focus"
    | "mistakes"
    | "vocabulary"
    | "dimMath"
    | "dimMock";
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
  statKey?: string;
  statValue?: string;
  variant: FeatureVariant;
};

const CARDS: FeatureCardDef[] = [
  {
    id: "books",
    icon: Library,
    titleKey: "beta.cardTitle",
    bodyKey: "beta.cardBody",
    statKey: "home.feature9Stat",
    statValue: "40+",
    variant: "navy",
  },
  {
    id: "practice",
    icon: ClipboardCheck,
    titleKey: "home.feature1Title",
    bodyKey: "home.feature1Body",
    statKey: "home.feature1Stat",
    statValue: "5,000+",
    variant: "accent",
  },
  {
    id: "progress",
    icon: TrendingUp,
    titleKey: "home.feature2Title",
    bodyKey: "home.feature2Body",
    statKey: "home.feature2Stat",
    statValue: "+24%",
    variant: "neutral",
  },
  {
    id: "explanations",
    icon: Lightbulb,
    titleKey: "home.feature3Title",
    bodyKey: "home.feature3Body",
    variant: "navy",
  },
  {
    id: "dimMath",
    icon: Sigma,
    titleKey: "home.feature7Title",
    bodyKey: "home.feature7Body",
    statKey: "home.feature7Stat",
    statValue: "40",
    variant: "dim",
  },
  {
    id: "focus",
    icon: Target,
    titleKey: "home.feature4Title",
    bodyKey: "home.feature4Body",
    statKey: "home.feature4Stat",
    statValue: "3",
    variant: "accent",
  },
  {
    id: "mistakes",
    icon: RotateCcw,
    titleKey: "home.feature5Title",
    bodyKey: "home.feature5Body",
    statKey: "home.feature5Stat",
    statValue: "12",
    variant: "neutral",
  },
  {
    id: "vocabulary",
    icon: BookMarked,
    titleKey: "home.feature6Title",
    bodyKey: "home.feature6Body",
    statKey: "home.feature6Stat",
    statValue: "127",
    variant: "navy",
  },
  {
    id: "dimMock",
    icon: Timer,
    titleKey: "home.feature8Title",
    bodyKey: "home.feature8Body",
    variant: "dim",
  },
];

/** Real chapter titles from the DİM math syllabus (DIM_MATH_CHAPTERS). */
const DIM_CHAPTERS = ["Natural ədədlər", "Çoxluqlar", "Həqiqi ədədlər"];

/**
 * Each card carries a miniature of a real Keplerly screen rather than filler —
 * built from the design tokens so it recolors correctly on the accent, neutral
 * and navy card variants and in both themes.
 */
function CardVisual({
  id,
  t,
}: {
  id: FeatureCardDef["id"];
  t: ReturnType<typeof useTranslations>;
}) {
  if (id === "books") {
    const betaLabel = t("beta.badge");
    // Original cover shapes in Keplerly's palette — deliberately not replicas
    // of any real publisher's artwork. Depth of field: back row blurs most.
    return (
      <div className="kf-mini kf-mini--books" aria-hidden>
        <span className="kf-book kf-book--back kf-book--b1" />
        <span className="kf-book kf-book--back kf-book--b2" />
        <span className="kf-book kf-book--mid kf-book--b3" />
        <span className="kf-book kf-book--mid kf-book--b4" />
        <span className="kf-book kf-book--front kf-book--b5" />
        <span className="kf-books-badge">{betaLabel}</span>
        <span className="kf-mini-books-mark">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="5.4" fill="currentColor" />
            <ellipse
              cx="12"
              cy="12"
              rx="10.5"
              ry="3.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              transform="rotate(-24 12 12)"
              opacity="0.9"
            />
          </svg>
        </span>
      </div>
    );
  }

  if (id === "practice") {
    return (
      <div className="kf-mini kf-mini--question" aria-hidden>
        <div className="kf-mini-head">
          <span className="kf-mini-badge">SAT</span>
          <span className="kf-mini-time">12:04</span>
        </div>
        <span className="kf-mini-q" />
        <span className="kf-mini-q kf-mini-q--short" />
        <div className="kf-mini-choices">
          {["A", "B", "C"].map((key) => (
            <span
              key={key}
              className={`kf-mini-choice${key === "B" ? " is-correct" : ""}`}
            >
              <i>{key}</i>
              <b />
              {key === "B" ? (
                <svg viewBox="0 0 16 16" className="kf-mini-tick">
                  <path
                    d="M3.5 8.4 6.4 11.3 12.5 4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (id === "progress") {
    return (
      <div className="kf-mini kf-mini--chart" aria-hidden>
        <div className="kf-mini-scores">
          <span>1300</span>
          <svg viewBox="0 0 14 8" className="kf-mini-arrow">
            <path
              d="M1 4h11M9 1l3 3-3 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <b>1550</b>
        </div>
        <svg viewBox="0 0 200 48" className="kf-mini-graph" preserveAspectRatio="none">
          <defs>
            <linearGradient id="kfArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[12, 24, 36].map((y) => (
            <line key={y} x1="0" y1={y} x2="200" y2={y} className="kf-mini-grid" />
          ))}
          <path
            d="M0 42 L33 37 L66 39 L100 26 L133 20 L166 11 L200 5 L200 48 L0 48 Z"
            fill="url(#kfArea)"
          />
          <path
            className="kf-mini-line"
            d="M0 42 L33 37 L66 39 L100 26 L133 20 L166 11 L200 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="5" r="3" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (id === "explanations") {
    return (
      <div className="kf-mini kf-mini--review" aria-hidden>
        <span className="kf-mini-answer">
          <i>D</i>
          <b />
          <em>✓</em>
        </span>
        <span className="kf-mini-eyebrow">{t("home.deckDemo.mistakesLabel")}</span>
        <span className="kf-mini-line" />
        <span className="kf-mini-line kf-mini-line--short" />
      </div>
    );
  }

  if (id === "focus") {
    const topics: [string, number][] = [
      [t("home.deckDemo.mistakeSkillA"), 42],
      [t("home.deckDemo.mistakeSkillD"), 68],
      [t("home.deckDemo.mistakeSkillC"), 88],
    ];
    return (
      <div className="kf-mini kf-mini--topics" aria-hidden>
        {topics.map(([name, pct], i) => (
          <span className="kf-mini-topic" key={name}>
            <span className="kf-mini-topic-name">{name}</span>
            <span className="kf-mini-topic-bar">
              <b
                style={{
                  ["--kf-fill" as string]: `${pct}%`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            </span>
          </span>
        ))}
      </div>
    );
  }

  if (id === "mistakes") {
    return (
      <div className="kf-mini kf-mini--mistakes" aria-hidden>
        <span className="kf-mini-row">
          <i className="kf-mini-mark is-wrong">✕</i>
          <span className="kf-mini-tag">{t("home.deckDemo.mistakeSkillA")}</span>
          <span className="kf-mini-chip">{t("home.deckDemo.reviewAgainChip")}</span>
        </span>
        <span className="kf-mini-row">
          <i className="kf-mini-mark is-right">✓</i>
          <span className="kf-mini-tag">{t("home.deckDemo.mistakeSkillD")}</span>
          <span className="kf-mini-chip is-done">100%</span>
        </span>
      </div>
    );
  }

  if (id === "dimMath") {
    return (
      <div className="kf-mini kf-mini--syllabus" aria-hidden>
        {DIM_CHAPTERS.map((title, i) => (
          <span
            className="kf-mini-chapter"
            key={title}
            style={{ animationDelay: `${i * 2.4}s` }}
          >
            <i>{i + 1}</i>
            <span className="kf-mini-chapter-name">{title}</span>
            <b />
          </span>
        ))}
      </div>
    );
  }

  if (id === "dimMock") {
    return (
      <div className="kf-mini kf-mini--mock" aria-hidden>
        <div className="kf-mini-mock-head">
          <span className="kf-mini-badge">DİM</span>
          <span className="kf-mini-progress">
            <b />
          </span>
        </div>
        <div className="kf-mini-grid-cells">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              className="kf-mini-cell"
              key={i}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="kf-mini kf-mini--vocab" aria-hidden>
      <div className="kf-mini-vocab-head">
        <span className="kf-mini-word">meticulous</span>
        <span className="kf-mini-pos">{t("home.deckDemo.vocabPosAdj")}</span>
      </div>
      <span className="kf-mini-meaning">{t("home.deckDemo.vocabMeaningA")}</span>
    </div>
  );
}

function FeatureCard({
  card,
  t,
  mobile = false,
  duplicate = false,
}: {
  card: FeatureCardDef;
  t: ReturnType<typeof useTranslations>;
  mobile?: boolean;
  duplicate?: boolean;
}) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const Icon = card.icon;
  const hasStat = Boolean(card.statValue && card.statKey);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const classes = [
    "kepler-feature-card",
    `kepler-feature-card--${card.variant}`,
    hasStat ? "" : "kepler-feature-card--no-stat",
    mobile ? "kepler-feature-card--mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      data-card={card.id}
      style={{ "--card-mx": `${glow.x}%`, "--card-my": `${glow.y}%` } as CSSProperties}
      onPointerMove={onPointerMove}
      tabIndex={duplicate ? -1 : 0}
      aria-hidden={duplicate ? true : undefined}
    >
      {card.id === "focus" ? <span className="kepler-feature-ring" aria-hidden /> : null}

      <div className="kepler-feature-card-top">
        <span className="kepler-feature-icon-chip">
          <Icon className="kepler-feature-icon" aria-hidden />
        </span>

        {hasStat ? (
          <div className="kepler-feature-stat">
            <span className="kepler-feature-stat-value">{card.statValue}</span>
            <span className="kepler-feature-stat-label">{t(card.statKey as string)}</span>
            {card.id === "progress" ? (
              <svg
                className="kepler-feature-spark"
                viewBox="0 0 40 16"
                aria-hidden
              >
                <path d="M1 13 L11 9 L21 11 L30 4 L39 2" />
              </svg>
            ) : null}
          </div>
        ) : null}
      </div>

      <h3 className="kepler-feature-title">{t(card.titleKey)}</h3>
      <p className="kepler-feature-body">{t(card.bodyKey)}</p>

      <CardVisual id={card.id} t={t} />
    </div>
  );
}

export function WhyKeplerShowcase() {
  const t = useTranslations();

  return (
    <section
      id="about"
      className="site-section kepler-feature-section mx-auto max-w-6xl px-6 py-16"
    >
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-foreground">{t("home.whyTitle")}</h2>
        <p className="mt-2 text-muted">{t("home.whySubtitle")}</p>
      </div>

      <div className="kepler-feature-glow" aria-hidden />

      <div className="kepler-feature-viewport hidden md:block">
        <div className="kepler-feature-track">
          {CARDS.map((card) => (
            <FeatureCard key={card.id} card={card} t={t} />
          ))}
          {CARDS.map((card) => (
            <FeatureCard key={`${card.id}-dup`} card={card} t={t} duplicate />
          ))}
        </div>
      </div>

      <div className="kepler-feature-mobile-row flex md:hidden">
        {CARDS.map((card) => (
          <FeatureCard key={`${card.id}-mobile`} card={card} t={t} mobile />
        ))}
      </div>
    </section>
  );
}
