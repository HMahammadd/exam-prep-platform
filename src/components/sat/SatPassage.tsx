import type { CSSProperties } from "react";

type CrossTextBlock = {
  label: string;
  body: string;
};

export function parseCrossTextPassage(passage: string): CrossTextBlock[] | null {
  const trimmed = passage.trim();
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
  /** Visual density — exam uses Bluebook sizing; review is compact */
  variant?: "exam" | "review";
};

export function SatPassage({
  passage,
  className = "",
  style,
  variant = "exam",
}: SatPassageProps) {
  const crossText = parseCrossTextPassage(passage);
  const isExam = variant === "exam";
  const textClass = isExam
    ? "text-[17px] leading-8 text-[#202124]"
    : "text-sm leading-6 text-muted";
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
            <p className="mt-1 whitespace-pre-line">{block.body}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className={`whitespace-pre-line ${textClass} ${className}`} style={fontStyle}>
      {passage}
    </p>
  );
}
