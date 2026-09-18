"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type FaqItem = { question: string; answer: string };

function useSupportsHover() {
  const [supportsHover, setSupportsHover] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setSupportsHover(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return supportsHover;
}

function FaqRow({
  faq,
  index,
  isOpen,
  supportsHover,
  onToggle,
  onEnter,
  onLeave,
}: {
  faq: FaqItem;
  index: number;
  isOpen: boolean;
  supportsHover: boolean;
  onToggle: (index: number) => void;
  onEnter: (index: number) => void;
  onLeave: (index: number) => void;
}) {
  const uid = useId();
  const triggerId = `${uid}-trigger`;
  const panelId = `${uid}-panel`;
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the real, rendered answer height (varies by locale and viewport
  // width) instead of animating to a hardcoded or guessed value.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContentHeight(entries[0]?.contentRect.height ?? el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className={`faq-item group rounded-2xl border border-card-border bg-card p-5 shadow-card${isOpen ? " is-open" : ""}`}
      style={{ "--faq-mx": `${glow.x}%`, "--faq-my": `${glow.y}%` } as CSSProperties}
      onPointerMove={onPointerMove}
      onMouseEnter={supportsHover ? () => onEnter(index) : undefined}
      onMouseLeave={supportsHover ? () => onLeave(index) : undefined}
    >
      <button
        id={triggerId}
        type="button"
        className="faq-item-trigger flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(index)}
      >
        {faq.question}
        <span
          className={`faq-item-icon text-accent${isOpen ? " is-open" : ""}`}
          aria-hidden
        >
          +
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="faq-answer-wrap"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : "0px" }}
      >
        <div className="faq-answer-inner" ref={contentRef}>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const supportsHover = useSupportsHover();

  return (
    <div className="space-y-4">
      {items.map((faq, index) => (
        <FaqRow
          key={faq.question}
          faq={faq}
          index={index}
          isOpen={activeIndex === index}
          supportsHover={supportsHover}
          onToggle={(i) => setActiveIndex((prev) => (prev === i ? null : i))}
          onEnter={(i) => setActiveIndex(i)}
          onLeave={(i) => setActiveIndex((prev) => (prev === i ? null : prev))}
        />
      ))}
    </div>
  );
}
