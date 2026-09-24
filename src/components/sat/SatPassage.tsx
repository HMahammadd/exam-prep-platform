import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";
import { normalizeWrappedProse } from "@/lib/normalize-prose";

type CrossTextBlock = {
  label: string;
  body: string;
};

/** Wraps the first case-insensitive occurrence of `term` in a highlight span. */
function withHighlight(text: string, term: string | undefined): ReactNode {
  if (!term || term.trim().length === 0) return text;

  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + term.length);
  const after = text.slice(index + term.length);

  return (
    <Fragment>
      {before}
      <mark className="sat-passage-highlight">{match}</mark>
      {after}
    </Fragment>
  );
}

export function parseCrossTextPassage(passage: string): CrossTextBlock[] | null {
  const trimmed = normalizeWrappedProse(passage);
  const match = trimmed.match(
    /^Text\s*1\s*\n([\s\S]*?)\n+Text\s*2\s*\n([\s\S]*)$/i
  );
  if (!match) {
    return null;
  }

  return [
    { label: "Text 1", body: match[1].trim() },
    { label: "Text 2", body: match[2].trim() },
  ];
}

type SatPassageProps = {
  passage: string;
  className?: string;
  style?: CSSProperties;
  /** Visual density — exam uses Bluebook sizing, review is compact, mistake is comfortable reading size */
  variant?: "exam" | "review" | "mistake";
  /** When set, the first case-insensitive match is wrapped in a coral highlight span. */
  highlightTerm?: string;
};

export function SatPassage({
  passage,
  className = "",
  style,
  variant = "exam",
  highlightTerm,
}: SatPassageProps) {
  const crossText = parseCrossTextPassage(passage);
  const isExam = variant === "exam";
  const textClass =
    variant === "exam"
      ? "text-[17px] leading-8 text-[#202124]"
      : variant === "mistake"
        ? "text-[17px] leading-[1.6] text-foreground"
        : "text-[15px] leading-7 text-foreground";
  const fontStyle: CSSProperties = isExam
    ? { fontFamily: "Georgia, 'Times New Roman', serif", ...style }
    : { ...style };

  if (crossText) {
    return (
      <div
        className={`${isExam ? "space-y-10" : "space-y-5"} ${textClass} ${className}`}
        style={fontStyle}
      >
        {crossText.map((block) => (
          <div key={block.label}>
            <p className="font-bold text-inherit">{block.label}</p>
            <p className="mt-1 whitespace-pre-line">
              {withHighlight(block.body, highlightTerm)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className={`whitespace-pre-line ${textClass} ${className}`} style={fontStyle}>
      {withHighlight(normalizeWrappedProse(passage), highlightTerm)}
    </p>
  );
}
