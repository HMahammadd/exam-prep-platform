"use client";

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
import { NAV_ITEMS } from "@/components/navItems";
import { useSectionNav } from "@/components/useSectionNav";
import { withLocale } from "@/lib/i18n/config";

const LEAD_K = 280;
const TRAIL_K = 118;
const DAMPING = 26;
// Calmer spring for passive scrollspy-driven moves (item 4: less snap than a click).
const SCROLL_LEAD_K = 150;
const SCROLL_TRAIL_K = 90;
const SCROLL_DAMPING = 30;
const SETTLE_EPS = 0.35;
const SETTLE_VEL = 0.12;

type Edge = {
  pos: number;
  vel: number;
  target: number;
  k: number;
  damping: number;
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
  const force = -edge.k * (edge.pos - edge.target) - edge.damping * edge.vel;
  edge.vel += force * dt;
  edge.pos += edge.vel * dt;
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
  const { activeId, activeSource, navigateToSection } = useSectionNav();

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const beadElRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const leftEdge = useRef<Edge>({ pos: 0, vel: 0, target: 0, k: LEAD_K, damping: DAMPING });
  const rightEdge = useRef<Edge>({ pos: 0, vel: 0, target: 0, k: LEAD_K, damping: DAMPING });
  const beadTop = useRef(0);
  const beadHeight = useRef(36);
  const settledId = useRef<string | null>(null);
  const hasPlaced = useRef(false);

  const [bead, setBead] = useState<BeadBox | null>(null);
  const [visible, setVisible] = useState(false);
  const [pointerGlow, setPointerGlow] = useState({ x: 50, y: 50 });

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
    (id: string | null, instant = false, calm = false) => {
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
      const leadK = calm ? SCROLL_LEAD_K : LEAD_K;
      const trailK = calm ? SCROLL_TRAIL_K : TRAIL_K;
      const damping = calm ? SCROLL_DAMPING : DAMPING;

      if (reduced) {
        stopLoop();
        leftEdge.current = {
          pos: nextLeft,
          vel: 0,
          target: nextLeft,
          k: leadK,
          damping,
        };
        rightEdge.current = {
          pos: nextRight,
          vel: 0,
          target: nextRight,
          k: leadK,
          damping,
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
      leftEdge.current.k = goingRight ? trailK : leadK;
      leftEdge.current.damping = damping;
      rightEdge.current.k = goingRight ? leadK : trailK;
      rightEdge.current.damping = damping;

      setVisible(true);
      settledId.current = id;
      hasPlaced.current = true;
      startLoop();
    },
    [measureItem, paintBead, startLoop, stopLoop]
  );

  useLayoutEffect(() => {
    moveTo(activeId, !hasPlaced.current, activeSource === "scroll");
  }, [activeId, activeSource, locale, density, moveTo]);

  useEffect(() => {
    const onResize = () => moveTo(activeId, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId, moveTo]);

  useEffect(() => () => stopLoop(), [stopLoop]);

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
              aria-current={isActive ? "true" : undefined}
              className={`liquid-nav-item${isActive ? " is-active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                navigateToSection(item.id);
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
