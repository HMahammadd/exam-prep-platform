"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { parseLocalePath, withLocale } from "@/lib/i18n/config";
import { isNavSectionId, SECTION_IDS, type NavSectionId } from "@/components/navItems";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Tracks which homepage section currently sits in the "activation band"
 * (roughly the upper-middle of the viewport) using a single thin
 * IntersectionObserver line, so the pill doesn't flicker between two
 * items near a section boundary.
 */
function useScrollSpy(enabled: boolean): NavSectionId | null {
  const [activeId, setActiveId] = useState<NavSectionId | null>(null);
  const intersecting = useRef<Set<NavSectionId>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const elements = SECTION_IDS.map((id) => ({
      id,
      el: document.getElementById(id),
    })).filter((entry): entry is { id: NavSectionId; el: HTMLElement } =>
      Boolean(entry.el)
    );
    if (elements.length === 0) return;

    intersecting.current = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as NavSectionId;
          if (entry.isIntersecting) intersecting.current.add(id);
          else intersecting.current.delete(id);
        }
        // Prefer the lowest section currently in the band — the one the
        // user has most recently scrolled into.
        for (let i = SECTION_IDS.length - 1; i >= 0; i -= 1) {
          const id = SECTION_IDS[i];
          if (intersecting.current.has(id)) {
            setActiveId(id);
            return;
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    elements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? activeId : null;
}

export function useSectionNav() {
  const { locale } = useI18n();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const barePath = parseLocalePath(pathname).pathname;
  const isHome = barePath === "/" || barePath === "";

  const [optimisticId, setOptimisticId] = useState<NavSectionId | null>(null);
  const [hash, setHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash.slice(1) : ""
  );

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.slice(1));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const scrollActiveId = useScrollSpy(isHome && !optimisticId);

  // Deep-link support: on first load of the homepage with a section hash,
  // scroll to it once (after entrance layout settles).
  useEffect(() => {
    if (!isHome) return;
    const initial = window.location.hash.slice(1);
    if (!isNavSectionId(initial) || initial === "home") return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(initial)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isHome]);

  useEffect(() => {
    if (!optimisticId) return;
    const clear = window.setTimeout(() => setOptimisticId(null), 900);
    return () => window.clearTimeout(clear);
  }, [optimisticId]);

  let activeId: NavSectionId | null = optimisticId;
  let activeSource: "click" | "scroll" | "route" = "click";
  if (!activeId) {
    if (isHome) {
      activeId = scrollActiveId ?? (isNavSectionId(hash) ? hash : "home");
      activeSource = "scroll";
    } else {
      activeId = null;
      activeSource = "route";
    }
  }

  const navigateToSection = (id: NavSectionId) => {
    setOptimisticId(id);

    if (isHome) {
      const target = id === "home" ? withLocale("/", locale) : `${withLocale("/", locale)}#${id}`;
      window.history.pushState(null, "", target);
      setHash(id === "home" ? "" : id);
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }
      return;
    }

    const target = id === "home" ? withLocale("/", locale) : `${withLocale("/", locale)}#${id}`;
    router.push(target);
  };

  return { activeId, activeSource, navigateToSection, isHome };
}
