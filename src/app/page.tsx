"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ListChecks,
  PenLine,
  Target,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { ExamFeatureDeck } from "@/components/ExamFeatureDeck";
import { ExamSpotlightSection } from "@/components/ExamSpotlightSection";
import { GraduationCapIcon } from "@/components/GraduationCapIcon";
import { useTranslations } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { LogInIcon } from "@/components/LogInIcon";
import { Navbar } from "@/components/Navbar";
import { ParticleWaveField } from "@/components/ParticleWaveField";
import { SampleQuestionCarousel } from "@/components/SampleQuestionCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { WhyKeplerShowcase } from "@/components/WhyKeplerShowcase";

function ExamConditionsSection() {
  const t = useTranslations();
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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
      { threshold: 0.22 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="practice"
      className={`site-section site-section--surface exam-conditions${inView ? " is-inview" : ""}`}
    >
      <div className="exam-conditions-shell mx-auto px-5 sm:px-6 py-12 md:py-14">
        <div className="exam-conditions-layout">
          <div className="exam-conditions-copy">
            <p className="exam-conditions-eyebrow">
              <Target className="h-4 w-4" aria-hidden />
              {t("home.builtFor")}
            </p>
            <h2 className="exam-conditions-title">
              {t("home.realConditionsTitle")}
            </h2>
          </div>

          <ExamFeatureDeck />

          <div className="exam-conditions-cta">
            <LocaleLink
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              {t("home.tryExam")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const t = useTranslations();

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
      <Navbar />

      <div className="home-screen">
        <section id="home" className="home-hero relative overflow-hidden">
          <ParticleWaveField />

          <div className="home-hero-inner relative z-10 mx-auto grid grid-cols-1 max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
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

      <div className="home-below">
        <ExamSpotlightSection />

        <ExamConditionsSection />

        <WhyKeplerShowcase />

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
    </div>
  );
}
