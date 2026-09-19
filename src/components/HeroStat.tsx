"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/I18nProvider";

/**
 * Counts to the value in the copy, keeping whatever suffix/separators that
 * string uses per locale ("10,000+" vs "10 000+"). One rAF loop for ~1s on
 * first view, then it stops for good.
 */
function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    // Reduced motion still lands on the final number, just immediately.
    const duration = reduced ? 0 : 1000;

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      // ease-out so it settles rather than stopping dead
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);

  return value;
}

export function HeroStat() {
  const t = useTranslations();
  const raw = t("hero.statValue");

  // Split "10,000+" into its number and whatever decoration surrounds it.
  const digits = raw.replace(/[^\d]/g, "");
  const target = Number(digits) || 0;
  const separator = raw.includes(",") ? "," : raw.includes(" ") ? " " : "";
  const suffix = raw.slice(raw.search(/[^\d\s,.]+$/)).trim();

  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const value = useCountUp(target, inView);

  const formatted = separator
    ? value.toLocaleString("en-US").replace(/,/g, separator)
    : String(value);

  return (
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-value">
        {formatted}
        {suffix}
      </span>
      <span className="hero-stat-label">{t("hero.statLabel")}</span>
    </div>
  );
}
