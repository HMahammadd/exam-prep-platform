"use client";

import {
  BookMarked,
  ClipboardCheck,
  Lightbulb,
  RotateCcw,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "@/components/I18nProvider";

type FeatureVariant = "accent" | "neutral" | "navy";

type FeatureCardDef = {
  id: "practice" | "progress" | "explanations" | "focus" | "mistakes" | "vocabulary";
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
  statKey?: string;
  statValue?: string;
  variant: FeatureVariant;
};

const CARDS: FeatureCardDef[] = [
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
];

/**
 * Each card gets a small bespoke visual instead of trailing white space —
 * drawn from the design tokens so it stays on-brand in both themes and
 * needs no third-party imagery.
 */
function CardVisual({ id }: { id: FeatureCardDef["id"] }) {
  if (id === "practice") {
    return (
      <div className="kf-visual kf-visual--choices" aria-hidden>
        <span className="kf-choice">
          <i>A</i>
        </span>
        <span className="kf-choice is-picked">
          <i>B</i>
          <svg viewBox="0 0 16 16" className="kf-choice-check">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="kf-choice">
          <i>C</i>
        </span>
        <span className="kf-choice">
          <i>D</i>
        </span>
      </div>
    );
  }

  if (id === "progress") {
    return (
      <div className="kf-visual" aria-hidden>
        <svg viewBox="0 0 200 54" className="kf-spark-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id="kfSparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 46 L34 40 L68 42 L102 28 L136 22 L170 12 L200 6 L200 54 L0 54 Z"
            fill="url(#kfSparkFill)"
          />
          <path
            className="kf-spark-line"
            d="M0 46 L34 40 L68 42 L102 28 L136 22 L170 12 L200 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="6" r="3.2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (id === "explanations") {
    return (
      <div className="kf-visual kf-visual--steps" aria-hidden>
        <span className="kf-step">
          <i>1</i>
          <b style={{ width: "72%" }} />
        </span>
        <span className="kf-step">
          <i>2</i>
          <b style={{ width: "88%" }} />
        </span>
        <span className="kf-step is-final">
          <i>3</i>
          <b style={{ width: "54%" }} />
        </span>
      </div>
    );
  }

  if (id === "focus") {
    return (
      <div className="kf-visual kf-visual--bars" aria-hidden>
        {[38, 64, 86].map((pct, i) => (
          <span className="kf-bar" key={pct}>
            <b style={{ ["--kf-fill" as string]: `${pct}%`, animationDelay: `${i * 90}ms` }} />
          </span>
        ))}
      </div>
    );
  }

  if (id === "mistakes") {
    return (
      <div className="kf-visual kf-visual--flip" aria-hidden>
        <span className="kf-flip kf-flip--wrong">✕</span>
        <svg viewBox="0 0 24 12" className="kf-flip-arrow">
          <path
            d="M1 6 H20 M16 2 L20 6 L16 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="kf-flip kf-flip--right">✓</span>
      </div>
    );
  }

  return (
    <div className="kf-visual kf-visual--words" aria-hidden>
      <span className="kf-word">perfunctory</span>
      <span className="kf-word">candid</span>
      <span className="kf-word is-new">meticulous</span>
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

      <CardVisual id={card.id} />
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
