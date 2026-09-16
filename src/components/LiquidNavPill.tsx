"use client";

import { GraduationCap, Home, Library, type LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n } from "@/components/I18nProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { parseLocalePath, withLocale } from "@/lib/i18n/config";

type NavItem = {
  id: string;
  href: string;
  labelKey: string;
  icon: LucideIcon;
  match: (barePath: string, hash: string) => boolean;
};

/** Destinations that already exist in the app. */
const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    href: "/",
    labelKey: "nav.home",
    icon: Home,
    match: (path, hash) =>
      (path === "/" || path === "") && hash !== "#exams" && hash !== "#practice",
  },
  {
    id: "exams",
    href: "/#exams",
    labelKey: "nav.exams",
    icon: Library,
    match: (path, hash) =>
      (path === "/" || path === "") && hash === "#exams",
  },
  {
    id: "practice",
    href: "/#practice",
    labelKey: "nav.practice",
    icon: GraduationCap,
    match: (path, hash) =>
      (path === "/" || path === "") && hash === "#practice",
  },
];

const LEAD_K = 280;
const TRAIL_K = 118;
const DAMPING = 26;
const SETTLE_EPS = 0.35;
const SETTLE_VEL = 0.12;

type Edge = {
  pos: number;
  vel: number;
  target: number;
  k: number;
};

type BeadBox = {
  left: number;
  width: number;
  top: number;
  height: number;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stepEdge(edge: Edge, dt: number) {
  const force = -edge.k * (edge.pos - edge.target) - DAMPING * edge.vel;
  edge.vel += force * dt;
  edge.pos += edge.vel * dt;
}

function resolveActiveId(barePath: string, hash: string): string | null {
  const hit = NAV_ITEMS.find((item) => item.match(barePath, hash));
  return hit?.id ?? null;
}

type LiquidNavPillProps = {
  className?: string;
  /** Compact density for mobile / scrolled states */
  density?: "default" | "compact";
};

export function LiquidNavPill({
  className = "",
  density = "default",
}: LiquidNavPillProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const barePath = parseLocalePath(pathname).pathname;

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const beadElRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const leftEdge = useRef<Edge>({ pos: 0, vel: 0, target: 0, k: LEAD_K });
  const rightEdge = useRef<Edge>({ pos: 0, vel: 0, target: 0, k: LEAD_K });
  const beadTop = useRef(0);
  const beadHeight = useRef(36);
  const settledId = useRef<string | null>(null);
  const hasPlaced = useRef(false);

  const [hash, setHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash : ""
  );
  const [optimisticId, setOptimisticId] = useState<string | null>(null);
  const [bead, setBead] = useState<BeadBox | null>(null);
  const [visible, setVisible] = useState(false);
  const [pointerGlow, setPointerGlow] = useState({ x: 50, y: 50 });

  const routeActiveId = resolveActiveId(barePath, hash);
  const activeId = optimisticId ?? routeActiveId;

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    if (optimisticId && routeActiveId === optimisticId) {
      setOptimisticId(null);
    }
  }, [optimisticId, routeActiveId]);

  const measureItem = useCallback((id: string): BeadBox | null => {
    const track = trackRef.current;
    const el = itemRefs.current[id];
    if (!track || !el) return null;
    const tr = track.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return {
      left: er.left - tr.left,
      width: er.width,
      top: er.top - tr.top,
      height: er.height,
    };
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const paintBead = useCallback((box: BeadBox, opacity = 1) => {
    const el = beadElRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
    el.style.opacity = String(opacity);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    let last = performance.now();
    let frames = 0;

    const tick = (now: number) => {
      const rawDt = (now - last) / 1000;
      last = now;
      const dt = Math.min(rawDt, 0.032);
      frames += 1;

      stepEdge(leftEdge.current, dt);
      stepEdge(rightEdge.current, dt);

      const left = leftEdge.current.pos;
      const right = rightEdge.current.pos;
      const width = Math.max(right - left, 1);
      const targetW = Math.max(
        rightEdge.current.target - leftEdge.current.target,
        1
      );
      const stretch = width / targetW;
      const squash = Math.min(1, Math.max(0.9, 1 / Math.sqrt(stretch)));

      paintBead(
        {
          left,
          width,
          top: beadTop.current + ((1 - squash) * beadHeight.current) / 2,
          height: beadHeight.current * squash,
        },
        Math.min(1, 0.92 + (stretch - 1) * 0.08)
      );

      const settled =
        frames > 90 ||
        (Math.abs(leftEdge.current.pos - leftEdge.current.target) <
          SETTLE_EPS &&
          Math.abs(rightEdge.current.pos - rightEdge.current.target) <
            SETTLE_EPS &&
          Math.abs(leftEdge.current.vel) < SETTLE_VEL &&
          Math.abs(rightEdge.current.vel) < SETTLE_VEL);

      if (settled) {
        leftEdge.current.pos = leftEdge.current.target;
        rightEdge.current.pos = rightEdge.current.target;
        leftEdge.current.vel = 0;
        rightEdge.current.vel = 0;
        const finalBox = {
          left: leftEdge.current.pos,
          width: rightEdge.current.pos - leftEdge.current.pos,
          top: beadTop.current,
          height: beadHeight.current,
        };
        paintBead(finalBox, 1);
        setBead(finalBox);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [paintBead]);

  const moveTo = useCallback(
    (id: string | null, instant = false) => {
      if (!id) {
        setVisible(false);
        settledId.current = null;
        stopLoop();
        return;
      }

      const box = measureItem(id);
      if (!box || box.width < 1) return;

      const nextLeft = box.left;
      const nextRight = box.left + box.width;
      beadTop.current = box.top;
      beadHeight.current = box.height;

      const reduced = prefersReducedMotion() || instant || !hasPlaced.current;

      if (reduced) {
        stopLoop();
        leftEdge.current = {
          pos: nextLeft,
          vel: 0,
          target: nextLeft,
          k: LEAD_K,
        };
        rightEdge.current = {
          pos: nextRight,
          vel: 0,
          target: nextRight,
          k: LEAD_K,
        };
        const next = {
          left: nextLeft,
          width: box.width,
          top: box.top,
          height: box.height,
        };
        setBead(next);
        setVisible(true);
        hasPlaced.current = true;
        settledId.current = id;
        requestAnimationFrame(() => paintBead(next, 1));
        return;
      }

      const fromMid =
        (leftEdge.current.pos + rightEdge.current.pos) / 2;
      const toMid = (nextLeft + nextRight) / 2;
      const goingRight = toMid >= fromMid;

      leftEdge.current.target = nextLeft;
      rightEdge.current.target = nextRight;
      leftEdge.current.k = goingRight ? TRAIL_K : LEAD_K;
      rightEdge.current.k = goingRight ? LEAD_K : TRAIL_K;

      setVisible(true);
      settledId.current = id;
      hasPlaced.current = true;
      startLoop();
    },
    [measureItem, paintBead, startLoop, stopLoop]
  );

  useLayoutEffect(() => {
    moveTo(activeId, !hasPlaced.current);
  }, [activeId, locale, density, moveTo]);

  useEffect(() => {
    const onResize = () => moveTo(activeId, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId, moveTo]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  const navigateTo = (item: NavItem) => {
    setOptimisticId(item.id);
    moveTo(item.id, false);

    if (item.id === "exams" || item.id === "practice") {
      const hash = item.id === "exams" ? "exams" : "practice";
      const target = `${withLocale("/", locale)}#${hash}`;
      if (barePath === "/" || barePath === "") {
        window.history.pushState(null, "", target);
        setHash(`#${hash}`);
        document.getElementById(hash)?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      } else {
        router.push(target);
      }
      return;
    }

    const home = withLocale("/", locale);
    if (barePath === "/" || barePath === "") {
      if (window.location.hash) {
        window.history.pushState(null, "", home);
        setHash("");
      }
      // Instant scroll avoids mid-scroll layout thrash; liquid bead already animates.
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      router.push(home);
    }
  };

  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointerGlow({ x, y });
  };

  return (
    <nav
      className={`liquid-nav density-${density} ${className}`.trim()}
      aria-label="Primary"
      style={
        {
          "--liquid-mx": `${pointerGlow.x}%`,
          "--liquid-my": `${pointerGlow.y}%`,
        } as CSSProperties
      }
      onPointerMove={onTrackPointerMove}
    >
      <div className="liquid-nav-track" ref={trackRef} role="tablist">
        <span
          ref={beadElRef}
          className="liquid-nav-bead"
          aria-hidden
          style={{
            opacity: visible && bead ? 1 : 0,
            transform: bead
              ? `translate3d(${bead.left}px, ${bead.top}px, 0)`
              : undefined,
            width: bead?.width,
            height: bead?.height,
          }}
        />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node;
              }}
              href={
                item.href.startsWith("/#")
                  ? `${withLocale("/", locale)}#${item.href.slice(2)}`
                  : withLocale(item.href, locale)
              }
              role="tab"
              aria-selected={isActive}
              className={`liquid-nav-item${isActive ? " is-active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(item);
              }}
            >
              <Icon className="liquid-nav-icon" aria-hidden />
              <span className="liquid-nav-label">{t(item.labelKey)}</span>
            </a>
          );
        })}

        <span className="liquid-nav-divider" aria-hidden />
        <ThemeToggle variant="nav" />
      </div>
    </nav>
  );
}
