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
