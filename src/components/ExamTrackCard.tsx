import { ArrowRight, Clock } from "lucide-react";
import { createElement } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { getExamIcon } from "@/lib/exam-icons";
import type { Exam } from "@/lib/exams";

/**
 * One card for every exam — same dimensions, spacing, type scale, icon
 * placement and animation; only the fill colour changes.
 *
 * Two layers sit absolutely inside a fixed-ratio box: the cover (icon +
 * wordmark on the exam colour) and the details. Because both are absolute,
 * swapping them can never resize the card or reflow the grid.
 */

type TrackContent = {
  subtitle: string;
  bullets: string[];
  note: string;
  cta: string;
};

const CONTENT: Record<string, TrackContent> = {
  sat: {
    subtitle: "Digital SAT Preparation",
    bullets: ["Reading & Writing", "Math", "Full Practice Exams"],
    note: "2,500+ practice questions",
    cta: "Start SAT Practice",
  },
  toefl: {
    subtitle: "English Proficiency Preparation",
    bullets: ["Reading", "Listening", "Speaking & Writing"],
    note: "Realistic TOEFL-style practice",
    cta: "Coming Soon",
  },
  dim: {
    subtitle: "Buraxılış və blok imtahanlarına hazırlıq",
    bullets: ["Azərbaycan dili", "Riyaziyyat", "Mövzu üzrə tapşırıqlar"],
    note: "2,800+ planned questions",
    cta: "Coming Soon",
  },
};

/** The same concentric arcs on every card, so the set reads as one system. */
function CoverDecor() {
  return (
    <svg className="track-card-arcs" viewBox="0 0 220 220" fill="none" aria-hidden>
      <circle cx="26" cy="196" r="88" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="196" r="128" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="196" r="168" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ExamTrackCard({ exam }: { exam: Exam }) {
  const content = CONTENT[exam.id];
  if (!content) return null;

  // An element, not a component reference — the icon is fixed per exam id.
  const icon = createElement(getExamIcon(exam.id));
  const available = exam.status === "available";

  return (
    <article className="track-card" data-exam={exam.id}>
      {/* ---- Layer 1: cover — icon over wordmark, nothing else ---- */}
      <div className="track-card-cover">
        <CoverDecor />
        <span className="track-card-icon" aria-hidden>
          {icon}
        </span>
        <span className="track-card-wordmark">{exam.name}</span>
      </div>

      {/* ---- Layer 2: the details, revealed on hover/focus ---- */}
      <div className="track-card-detail">
        <div className="track-card-detail-head">
          <span className="track-card-icon" aria-hidden>
            {icon}
          </span>
          {!available ? (
            <span className="track-card-soon">Coming Soon</span>
          ) : null}
        </div>

        <h3 className="track-card-title">{exam.name}</h3>
        <p className="track-card-subtitle">{content.subtitle}</p>

        <ul className="track-card-list">
          {content.bullets.map((bullet) => (
            <li key={bullet}>
              <span className="track-card-dot" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>

        <p className="track-card-note">{content.note}</p>

        {available ? (
          <LocaleLink href={exam.dashboardHref} className="track-card-cta">
            {content.cta}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </LocaleLink>
        ) : (
          <span className="track-card-cta is-disabled">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            {content.cta}
          </span>
        )}
      </div>
    </article>
  );
}
