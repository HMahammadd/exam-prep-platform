"use client";

import { Fragment, useEffect, useState } from "react";

type DimMathContentProps = {
  text: string;
  className?: string;
  /** Use inside buttons or other inline contexts — avoids block-level wrappers. */
  inline?: boolean;
};

const MATH_PATTERN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

type KatexModule = typeof import("katex");

function renderKatex(
  katex: KatexModule["default"],
  latex: string,
  displayMode: boolean,
  key: string,
  inline: boolean
) {
  const html = katex.renderToString(latex, {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });

  if (displayMode) {
    const Tag = inline ? "span" : "div";
    return (
      <Tag
        key={key}
        className="my-2 block overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span key={key} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function renderLine(
  katex: KatexModule["default"],
  line: string,
  lineKey: string,
  inline: boolean
) {
  const parts = line.split(MATH_PATTERN);

  return (
    <Fragment key={lineKey}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return renderKatex(
            katex,
            part.slice(2, -2).trim(),
            true,
            `${lineKey}-d-${index}`,
            inline
          );
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          return renderKatex(
            katex,
            part.slice(1, -1).trim(),
            false,
            `${lineKey}-i-${index}`,
            inline
          );
        }

        return <Fragment key={`${lineKey}-t-${index}`}>{part}</Fragment>;
      })}
    </Fragment>
  );
}

function PlainMathFallback({
  text,
  className,
  inline,
}: DimMathContentProps) {
  const Wrapper = inline ? "span" : "div";
  const lines = text.split("\n");

  return (
    <Wrapper className={className}>
      {lines.map((line, index) =>
        inline ? (
          <Fragment key={index}>
            {index > 0 && <br />}
            {line}
          </Fragment>
        ) : (
          <div key={index} className={index > 0 ? "mt-2" : undefined}>
            {line}
          </div>
        )
      )}
    </Wrapper>
  );
}

function KatexMathContent({
  text,
  className,
  inline = false,
  katex,
}: DimMathContentProps & { katex: KatexModule["default"] }) {
  const lines = text.split("\n");
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={className}>
      {lines.map((line, index) => {
        if (inline) {
          return (
            <Fragment key={index}>
              {index > 0 && <br />}
              {renderLine(katex, line, `line-${index}`, inline)}
            </Fragment>
          );
        }

        return (
          <div key={index} className={index > 0 ? "mt-2" : undefined}>
            {renderLine(katex, line, `line-${index}`, inline)}
          </div>
        );
      })}
    </Wrapper>
  );
}

/**
 * Renders text with $...$ / $$...$$ KaTeX. Loads katex (+ CSS) on demand so the
 * DIM math session shell can paint before the math library downloads.
 */
export function DimMathContent(props: DimMathContentProps) {
  const [katex, setKatex] = useState<KatexModule["default"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      import("katex"),
      import("katex/dist/katex.min.css"),
    ]).then(([mod]) => {
      if (!cancelled) {
        setKatex(() => mod.default);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!katex) {
    return <PlainMathFallback {...props} />;
  }

  return <KatexMathContent {...props} katex={katex} />;
}
