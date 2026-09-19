"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Target, UserPlus } from "lucide-react";
import { BetaBadge } from "@/components/BetaBadge";
import { ExamFeatureDeck } from "@/components/ExamFeatureDeck";
import { ExamSpotlightSection } from "@/components/ExamSpotlightSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { GraduationCapIcon } from "@/components/GraduationCapIcon";
import { useTranslations } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { LogInIcon } from "@/components/LogInIcon";
import { Navbar } from "@/components/Navbar";
import { ParticleWaveField } from "@/components/ParticleWaveField";
import { SampleQuestionCarousel } from "@/components/SampleQuestionCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolsShowcase } from "@/components/ToolsShowcase";
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

  const faqs: { question: string; answer: string }[] = [
    { question: t("home.faq1Q"), answer: t("home.faq1A") },
    { question: t("home.faq2Q"), answer: t("home.faq2A") },
    { question: t("home.faq3Q"), answer: t("home.faq3A") },
    { question: t("home.faq4Q"), answer: t("home.faq4A") },
    { question: t("beta.faqQ"), answer: t("beta.faqA") },
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
                <BetaBadge tone="hero" withSubline className="mb-5" />

                <LocaleLink
                  href="/signup"
                  className="home-hero-cta group/practice inline-flex items-center gap-2 rounded-[0.85rem] bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
                >
                  <GraduationCapIcon className="h-4 w-4 shrink-0" />
                  {t("beta.ctaFree")}
                </LocaleLink>

                <p className="beta-cta-note">{t("beta.noCard")}</p>
              </div>
            </div>

            <div className="home-reveal home-reveal-card">
              <SampleQuestionCarousel />
            </div>
          </div>
        </section>
      </div>

      <div className="home-below">
        <div className="beta-trustbar">
          <span className="beta-trustbar-item beta-trustbar-item--lead">
            <BetaBadge tone="soft" />
          </span>
          <span className="beta-trustbar-sep" aria-hidden />
          <span className="beta-trustbar-item">{t("beta.trustQuestions")}</span>
          <span className="beta-trustbar-sep" aria-hidden />
          <span className="beta-trustbar-item">{t("beta.trustUnlimited")}</span>
          <span className="beta-trustbar-sep" aria-hidden />
          <span className="beta-trustbar-item">{t("beta.trustNoCard")}</span>
        </div>

        <ExamSpotlightSection />

        <ExamConditionsSection />

        <WhyKeplerShowcase />

        <ToolsShowcase />

        <p className="beta-caption">{t("beta.toolsCaption")}</p>

        <section className="site-section mx-auto max-w-3xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {t("home.faqTitle")}
            </h2>
          </div>
          <FaqAccordion items={faqs} />
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
