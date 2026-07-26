"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { Fragment } from "react";

type DimMathContentProps = {
  text: string;
  className?: string;
  /** Use inside buttons or other inline contexts — avoids block-level wrappers. */
  inline?: boolean;
};

const MATH_PATTERN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

function renderKatex(
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

function renderLine(line: string, lineKey: string, inline: boolean) {
  const parts = line.split(MATH_PATTERN);

  return (
    <Fragment key={lineKey}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return renderKatex(
            part.slice(2, -2).trim(),
            true,
            `${lineKey}-d-${index}`,
            inline
          );
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          return renderKatex(
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

export function DimMathContent({
  text,
  className,
  inline = false,
}: DimMathContentProps) {
  const lines = text.split("\n");
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={className}>
      {lines.map((line, index) => {
        if (inline) {
          return (
            <Fragment key={index}>
              {index > 0 && <br />}
              {renderLine(line, `line-${index}`, inline)}
            </Fragment>
          );
        }

        return (
          <div key={index} className={index > 0 ? "mt-2" : undefined}>
            {renderLine(line, `line-${index}`, inline)}
          </div>
        );
      })}
    </Wrapper>
  );
}
