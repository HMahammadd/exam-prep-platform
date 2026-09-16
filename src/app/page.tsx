"use client";

import {
  ArrowRight,
  BarChart3,
  Bookmark,
  ClipboardList,
  Clock,
  Lightbulb,
  ListChecks,
  PenLine,
  Target,
  TrendingUp,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ExamSpotlightSection } from "@/components/ExamSpotlightSection";
import { GraduationCapIcon } from "@/components/GraduationCapIcon";
import { useTranslations } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { LogInIcon } from "@/components/LogInIcon";
import { Navbar } from "@/components/Navbar";
import { ParticleWaveField } from "@/components/ParticleWaveField";
import { SampleQuestionCarousel } from "@/components/SampleQuestionCarousel";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  const t = useTranslations();

  const examRoomFeatures: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      title: t("home.countdownTimer"),
      description: t("home.countdownTimerBody"),
      icon: Clock,
    },
    {
      title: t("home.markForReview"),
      description: t("home.markForReviewBody"),
      icon: Bookmark,
    },
    {
      title: t("home.eliminateChoices"),
      description: t("home.eliminateChoicesBody"),
      icon: XCircle,
    },
    {
      title: t("home.questionNavigator"),
      description: t("home.questionNavigatorBody"),
      icon: ListChecks,
    },
  ];

  const benefits: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      title: t("home.benefitPractice"),
      description: t("home.benefitPracticeBody"),
      icon: ClipboardList,
    },
    {
      title: t("home.benefitProgress"),
      description: t("home.benefitProgressBody"),
      icon: TrendingUp,
    },
    {
      title: t("home.benefitExplanations"),
      description: t("home.benefitExplanationsBody"),
      icon: Lightbulb,
    },
    {
      title: t("home.benefitFocus"),
      description: t("home.benefitFocusBody"),
      icon: Target,
    },
  ];

  const steps: { text: string; detail: string; icon: LucideIcon }[] = [
    {
      text: t("home.step1"),
      detail: t("home.step1Body"),
      icon: UserPlus,
    },
    {
      text: t("home.step2"),
      detail: t("home.step2Body"),
      icon: ListChecks,
    },
    {
      text: t("home.step3"),
      detail: t("home.step3Body"),
      icon: PenLine,
    },
    {
      text: t("home.step4"),
      detail: t("home.step4Body"),
      icon: BarChart3,
    },
  ];

  const faqs: { question: string; answer: string }[] = [
    { question: t("home.faq1Q"), answer: t("home.faq1A") },
    { question: t("home.faq2Q"), answer: t("home.faq2A") },
    { question: t("home.faq3Q"), answer: t("home.faq3A") },
    { question: t("home.faq4Q"), answer: t("home.faq4A") },
  ];

  const line1 = t("hero.line1");
  const examsHighlight = t("hero.examsHighlight");
  const line2Suffix = t("hero.line2Suffix");

  return (
    <div className="home-entrance flex flex-1 flex-col">
      <div className="home-screen">
        <Navbar />

        <section className="home-hero relative overflow-hidden">
          <ParticleWaveField />

          <div className="home-hero-inner relative z-10 mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
            <div className="hero-copy w-fit max-w-full justify-self-start">
              <h1 className="hero-copy-title text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {line1 ? (
                  <span className="hero-copy-line home-reveal home-reveal-title-a">
                    {line1}
                  </span>
                ) : null}
                <span className="hero-copy-line home-reveal home-reveal-title-b">
                  {examsHighlight ? (
                    <span className="hero-copy-exams">{examsHighlight}</span>
                  ) : null}
                  {line2Suffix ? <> {line2Suffix}</> : null}
                </span>
              </h1>

              <div className="hero-copy-actions home-reveal home-reveal-actions">
                <LocaleLink
                  href="/signup"
                  className="home-hero-cta group/practice inline-flex items-center gap-2 rounded-[0.85rem] bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
                >
                  <GraduationCapIcon className="h-4 w-4 shrink-0" />
                  {t("hero.cta")}
                </LocaleLink>
              </div>
            </div>

            <div className="home-reveal home-reveal-card">
              <SampleQuestionCarousel />
            </div>
          </div>
        </section>
      </div>

      <ExamSpotlightSection />

      <section className="site-section site-section--surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
                <Target className="h-4 w-4" aria-hidden />
                {t("home.builtFor")}
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                {t("home.realConditionsTitle")}
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-muted">
                {t("home.realConditionsBody")}
              </p>
              <LocaleLink
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                {t("home.tryExam")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LocaleLink>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {examRoomFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-card-border bg-background p-5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                      <Icon className="h-4 w-4 text-accent" aria-hidden />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="site-section mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {t("home.whyTitle")}
          </h2>
          <p className="mt-2 text-muted">{t("home.whySubtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-card-border bg-card p-6 shadow-card transition hover:-translate-y-1"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="site-section site-section--surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {t("home.howTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("home.howSubtitle")}</p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.text}
                  className="relative rounded-2xl border border-card-border bg-background p-6"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
                  </span>
                  <p className="mt-3 font-semibold text-foreground">
                    {step.text}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {step.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="site-section mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {t("home.faqTitle")}
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-card-border bg-card p-5 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {faq.question}
                <span
                  className="text-accent transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="site-section site-section--accent">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {t("home.finalTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            {t("home.finalBody")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LocaleLink
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              {t("home.createAccount")}
            </LocaleLink>
            <LocaleLink
              href="/login"
              className="group/login inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              <LogInIcon className="h-4 w-4 shrink-0" />
              {t("nav.login")}
            </LocaleLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
