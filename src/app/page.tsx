import {
  ArrowRight,
  Award,
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
import Link from "next/link";
import { GraduationCapIcon } from "@/components/GraduationCapIcon";
import { LogInIcon } from "@/components/LogInIcon";
import { Navbar } from "@/components/Navbar";
import { ParticleWaveField } from "@/components/ParticleWaveField";
import { SampleQuestionCarousel } from "@/components/SampleQuestionCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { EXAMS } from "@/lib/exams";
import { getExamIcon } from "@/lib/exam-icons";

const HIGHLIGHTS: { label: string; value: string; icon: LucideIcon }[] = [
  { value: "3", label: "Exam tracks", icon: ListChecks },
  { value: "Timed", label: "Full-length sections", icon: Clock },
  { value: "Instant", label: "Answer explanations", icon: Lightbulb },
  { value: "Free", label: "To create an account", icon: Award },
];

const EXAM_ROOM_FEATURES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Countdown timer",
    description:
      "Every section is timed, and you can hide the clock when it becomes a distraction.",
    icon: Clock,
  },
  {
    title: "Mark for review",
    description:
      "Flag any question and come back to it before you submit your section.",
    icon: Bookmark,
  },
  {
    title: "Eliminate choices",
    description:
      "Cross out answers you've ruled out so you can focus on what's left.",
    icon: XCircle,
  },
  {
    title: "Question navigator",
    description:
      "Jump to any question and see at a glance what's answered, flagged, or blank.",
    icon: ListChecks,
  },
];

const BENEFITS: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Practice exam-style questions",
    description:
      "Work through realistic questions designed to match real exam formats.",
    icon: ClipboardList,
  },
  {
    title: "Track your progress",
    description:
      "See how many questions you've solved and where you're improving.",
    icon: TrendingUp,
  },
  {
    title: "Learn from explanations",
    description:
      "Understand every answer with clear, step-by-step explanations.",
    icon: Lightbulb,
  },
  {
    title: "Focus on weak topics",
    description:
      "Identify the areas that need more practice and study smarter.",
    icon: Target,
  },
];

const STEPS: { text: string; detail: string; icon: LucideIcon }[] = [
  {
    text: "Create an account",
    detail: "Sign up with your email in a few seconds.",
    icon: UserPlus,
  },
  {
    text: "Choose your exam",
    detail: "Start with SAT or DIM practice sets.",
    icon: ListChecks,
  },
  {
    text: "Practice questions",
    detail: "Work under real, timed exam conditions.",
    icon: PenLine,
  },
  {
    text: "Review and improve",
    detail: "Read explanations and revisit weak topics.",
    icon: BarChart3,
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Which exams can I practice on Kepler?",
    answer:
      "SAT and DIM practice are available today, and TOEFL is coming soon. You can see the full list in the Exams section above.",
  },
  {
    question: "Does it feel like the real exam?",
    answer:
      "Yes. SAT practice runs in a timed, exam-style interface with a passage pane, mark for review, answer elimination, a question navigator, and a final review screen before you submit.",
  },
  {
    question: "Do I get to see why an answer was wrong?",
    answer:
      "After you submit, Kepler shows a full answer review — your answer, the correct answer, and a step-by-step explanation for each question.",
  },
  {
    question: "Is my progress saved?",
    answer:
      "Your exam attempts and scores are saved to your account, so you can retake an exam and compare your results over time.",
  },
];

export default function Home() {
  return (
    <div className="home-entrance flex flex-1 flex-col">
      <Navbar />

      {/* Hero */}
      <section className="home-hero relative overflow-hidden">
        <ParticleWaveField />

        <div className="home-hero-inner relative z-10 mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div className="hero-copy w-fit max-w-full justify-self-start">
            <h1 className="hero-copy-title text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <span className="hero-copy-line home-reveal home-reveal-title-a">
                Practice smarter for
              </span>
              <span className="hero-copy-line home-reveal home-reveal-title-b">
                <span className="hero-copy-exams">SAT, TOEFL,</span> and{" "}
                <span className="hero-copy-exams">DIM</span> exams.
              </span>
            </h1>

            <div className="hero-copy-actions home-reveal home-reveal-actions">
              <Link
                href="/signup"
                className="home-hero-cta group/practice inline-flex items-center gap-2 rounded-[0.85rem] bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                <GraduationCapIcon className="h-4 w-4 shrink-0" />
                Start Practicing
              </Link>
            </div>
          </div>

          <div className="home-reveal home-reveal-card">
            <SampleQuestionCarousel />
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="home-feature-strip">
        <div className="home-feature-strip-inner">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="home-feature-item">
                <span className="home-feature-icon">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="home-feature-value">{item.value}</p>
                  <p className="home-feature-label">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exams */}
      <section id="exams" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">Choose your exam</h2>
          <p className="mt-2 text-muted">
            Prepare for the exam that matters most to you.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {EXAMS.map((exam) => {
            const isAvailable = exam.status === "available";
            const ExamIcon = getExamIcon(exam.id);

            return (
              <div
                key={exam.id}
                className={`flex flex-col rounded-2xl border bg-card p-6 shadow-card transition ${
                  isAvailable
                    ? "border-accent hover:-translate-y-1 hover:shadow-lg"
                    : "border-card-border opacity-90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                      <ExamIcon className="h-5 w-5 text-accent" aria-hidden />
                    </span>
                    <h3 className="text-xl font-semibold text-foreground">
                      {exam.name} Practice
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isAvailable
                        ? "bg-accent-soft text-accent"
                        : "bg-card-border text-muted"
                    }`}
                  >
                    {isAvailable ? "Available" : "Coming Soon"}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {exam.description}
                </p>
                {isAvailable ? (
                  <Link
                    href="/signup"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : (
                  <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-sm font-medium text-muted">
                    <Clock className="h-4 w-4" aria-hidden />
                    Coming Soon
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Real exam conditions */}
      <section className="border-y border-card-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
                <Target className="h-4 w-4" aria-hidden />
                Built for test day
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                Practice under real exam conditions
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-muted">
                Kepler&apos;s SAT practice runs in a full exam interface — the
                same tools, pacing, and pressure you&apos;ll face on the real
                thing. No surprises when it counts.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Try a practice exam
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {EXAM_ROOM_FEATURES.map((feature) => {
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

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Why students choose Kepler
          </h2>
          <p className="mt-2 text-muted">
            Everything you need to turn practice into a better score.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
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

      {/* How it works */}
      <section className="border-y border-card-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
            <p className="mt-2 text-muted">
              From sign-up to score improvement in four steps.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
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

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-card-border bg-card p-5 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {faq.question}
                <span className="text-accent transition group-open:rotate-45" aria-hidden>
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

      {/* Final CTA */}
      <section className="border-t border-card-border bg-accent-soft">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to start practicing?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Create a free Kepler account and begin your SAT practice today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Create Account
            </Link>
            <Link
              href="/login"
              className="group/login inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              <LogInIcon className="h-4 w-4 shrink-0" />
              Log In
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
