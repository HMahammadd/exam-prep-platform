"use client";

import { useEffect, useRef } from "react";
import { HeroCelestial } from "@/components/HeroCelestial";

type Star = {
  homeX: number;
  homeY: number;
  ox: number;
  oy: number;
  size: number;
  phase: number;
  speed: number;
  outline: boolean;
  glow: boolean;
  charge: number;
  depth: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  fading: boolean;
  fade: number;
  trail: { x: number; y: number }[];
};

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  inner = radius * 0.2
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? radius : inner;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function hash(col: number, row: number) {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function ParticleWaveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const canvas: HTMLCanvasElement = node;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const hero = canvas.closest("section");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let dark = isDarkTheme();
    const stars: Star[] = [];
    let shooting: ShootingStar | null = null;
    let nextShootAt = 3.2;
    let width = 0;
    let height = 0;
    let rows = 36;
    let raf = 0;
    let visible = true;
    let start: number | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let pointer = 0;
    let targetPointer = 0;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;

      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const compact = width < 640;
      rows = compact ? 36 : 60;

      stars.length = 0;
      const starCount = compact ? 22 : 38;
      for (let i = 0; i < starCount; i++) {
        const depth = hash(i, 8);
        const sizeRoll = hash(i, 14);
        // Size tiers: many small, some medium, few bright accents
        const size =
          sizeRoll > 0.9
            ? 8.4 + hash(i, 17) * 3.2
            : sizeRoll > 0.62
              ? 5.1 + hash(i, 18) * 2.2
              : sizeRoll > 0.28
                ? 3.2 + hash(i, 19) * 1.5
                : 1.9 + hash(i, 20) * 1.1;

        stars.push({
          homeX: width * (0.03 + hash(i, 3) * 0.94),
          homeY: height * (0.02 + hash(i, 9) * 0.46),
          ox: 0,
          oy: 0,
          size,
          phase: hash(i, 21) * Math.PI * 2,
          speed: 0.28 + hash(i, 28) * 0.7,
          outline: hash(i, 35) > 0.7,
          glow: size > 4.6 || hash(i, 42) > 0.38,
          charge: hash(i, 49) > 0.5 ? 1 : -1,
          depth,
        });
      }
    }

    function spawnShootingStar(): ShootingStar {
      const fromLeft = Math.random() > 0.5;
      return {
        x: fromLeft
          ? width * (0.02 + Math.random() * 0.4)
          : width * (0.52 + Math.random() * 0.4),
        y: height * (0.04 + Math.random() * 0.22),
        vx: (fromLeft ? 1 : -1) * (1.8 + Math.random() * 0.9),
        vy: 0.42 + Math.random() * 0.32,
        life: 0,
        maxLife: 70 + Math.random() * 30,
        fading: false,
        fade: 1,
        trail: [],
      };
    }

    function drawWave(time: number) {
      const horizon = height * 0.48;
      const t = reducedMotion ? 1.2 : time * 0.36;
      // Stronger, wider cursor influence on the dotted surface
      const rippleR = 168;
      const rippleR2 = rippleR * rippleR;
      const pan = (cursorX / Math.max(width, 1) - 0.5) * pointer * 12;

      for (let row = 0; row < rows; row++) {
        const depth = row / (rows - 1);
        const near = 1 - depth;
        const yBase = horizon + Math.pow(near, 1.32) * (height - horizon);
        const spacing = 3.5 + near * 6.8;
        const amp = reducedMotion ? 4 : 11 + near * 20;
        const size = 1.15 + near * 2.25;
        const rowCols = Math.max(12, Math.round(width / spacing) + 4);

        for (let col = 0; col < rowCols; col++) {
          const xNorm = rowCols === 1 ? 0 : col / (rowCols - 1);
          const spread = 0.98 + near * 0.08;
          let px = width / 2 + (xNorm - 0.5) * width * spread + pan * near;
          const jitter = hash(col, row);

          let py =
            yBase +
            Math.sin(xNorm * 6.1 + t + depth * 3.6) * amp +
            Math.sin(xNorm * 2.8 - t * 0.55 + depth * 2) * amp * 0.45 +
            Math.sin(depth * 6.8 + t * 0.24) * amp * 0.22;

          if (!reducedMotion && pointer > 0.015) {
            const dx = px - cursorX;
            const dy = py - cursorY;
            const d2 = dx * dx + dy * dy;
            if (d2 < rippleR2 && d2 > 0.25) {
              const dist = Math.sqrt(d2);
              const falloff = (1 - dist / rippleR) * pointer;
              const soft = falloff * falloff;
              px += (dx / dist) * falloff * 10;
              py -= soft * 20 + falloff * 6;
            }
          }

          const flatten = Math.max(
            0,
            Math.min(1, (py - height * 0.74) / Math.max(height * 0.26, 1))
          );
          py += (height - 10 - py) * flatten * 0.42;

          if (px < -4 || px > width + 4 || py < horizon - 12 || py > height + 6) {
            continue;
          }

          // Clearer dots with better depth, still premium / not harsh
          const shadeR = dark ? 198 + near * 36 : 42;
          const shadeG = dark ? 216 + near * 22 : 78;
          const shadeB = dark ? 246 : 128;
          const cursorBoost =
            !reducedMotion && pointer > 0.02
              ? Math.max(
                  0,
                  1 - Math.hypot(px - cursorX, py - cursorY) / rippleR
                ) *
                pointer *
                0.35
              : 0;
          const alpha =
            (dark
              ? (0.28 + near * 0.52) * (0.82 + jitter * 0.2)
              : (0.26 + near * 0.42) * (0.84 + jitter * 0.18)) *
              (1 - flatten * 0.88) +
            cursorBoost;

          ctx.fillStyle = `rgba(${shadeR}, ${shadeG}, ${shadeB}, ${Math.min(alpha, 0.92)})`;

          if (size < 1.6) {
            ctx.fillRect(px, py, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(px, py, size * 0.52, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function drawCursorAura() {
      if (reducedMotion || pointer < 0.02) return;
      const g = ctx.createRadialGradient(
        cursorX,
        cursorY,
        0,
        cursorX,
        cursorY,
        210
      );
      if (dark) {
        g.addColorStop(0, `rgba(150, 190, 255, ${0.14 * pointer})`);
        g.addColorStop(0.35, `rgba(120, 165, 240, ${0.07 * pointer})`);
        g.addColorStop(1, "rgba(120, 165, 240, 0)");
      } else {
        g.addColorStop(0, `rgba(80, 130, 210, ${0.11 * pointer})`);
        g.addColorStop(0.4, `rgba(90, 140, 210, ${0.05 * pointer})`);
        g.addColorStop(1, "rgba(90, 140, 210, 0)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(cursorX - 220, cursorY - 220, 440, 440);
    }

    function drawStars(time: number) {
      const gatherR = 210;
      const partR = 78;
      const panX = (cursorX / Math.max(width, 1) - 0.5) * pointer;
      const panY = (cursorY / Math.max(height, 1) - 0.5) * pointer;

      for (const star of stars) {
        let targetOx = panX * (9 + star.depth * 18);
        let targetOy = panY * (6 + star.depth * 12);

        if (!reducedMotion && pointer > 0.015) {
          const dx = star.homeX - cursorX;
          const dy = star.homeY - cursorY;
          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;

          if (dist < partR) {
            const push =
              (1 - dist / partR) * 14 * pointer * (0.65 + star.depth * 0.45);
            targetOx += nx * push;
            targetOy += ny * push;
          } else if (dist < gatherR) {
            const pull =
              (1 - (dist - partR) / (gatherR - partR)) *
              9 *
              star.charge *
              pointer *
              (0.6 + star.depth * 0.5);
            targetOx -= nx * pull;
            targetOy -= ny * pull * 0.85;
          }
        }

        // Snappier follow so small mouse moves feel immediate
        star.ox += (targetOx - star.ox) * 0.14;
        star.oy += (targetOy - star.oy) * 0.14;

        const x = star.homeX + star.ox;
        const y = star.homeY + star.oy;
        const twinkle = reducedMotion
          ? 0.78
          : 0.66 + 0.34 * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase));
        const nearCursor =
          !reducedMotion && pointer > 0.02
            ? Math.max(0, 1 - Math.hypot(x - cursorX, y - cursorY) / 170)
            : 0;
        const toneR = dark ? 228 : 36;
        const toneG = dark ? 236 : 72;
        const toneB = dark ? 255 : 118;
        const r = star.size * (0.96 + twinkle * 0.1 + nearCursor * 0.16);

        if (star.glow || nearCursor > 0.15) {
          ctx.globalAlpha =
            ((dark ? 0.22 : 0.14) + nearCursor * 0.18) * twinkle;
          ctx.fillStyle = `rgb(${toneR}, ${toneG}, ${toneB})`;
          drawSparkle(ctx, x, y, r * 2.45, r * 0.48);
          ctx.fill();
        }

        ctx.globalAlpha =
          (dark ? 0.58 : 0.42) + twinkle * 0.28 + nearCursor * 0.22;
        ctx.fillStyle = `rgb(${toneR}, ${toneG}, ${toneB})`;
        ctx.strokeStyle = `rgba(${toneR}, ${toneG}, ${toneB}, 0.88)`;
        ctx.lineWidth = 1.1;
        drawSparkle(ctx, x, y, r);
        if (star.outline) ctx.stroke();
        else ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawShootingStar() {
      if (!shooting) return;

      const toneR = dark ? 214 : 30;
      const toneG = dark ? 226 : 58;
      const toneB = dark ? 245 : 95;
      const fade = shooting.fade;
      const trail = shooting.trail;
      if (trail.length > 1) {
        ctx.lineCap = "round";
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          if (!p0 || !p1) continue;
          const along = i / trail.length;
          ctx.strokeStyle = `rgba(${toneR}, ${toneG}, ${toneB}, ${along * fade * (dark ? 0.14 : 0.1)})`;
          ctx.lineWidth = 3 + along * 1.2;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${toneR}, ${toneG}, ${toneB}, ${along * fade * (dark ? 0.42 : 0.28)})`;
          ctx.lineWidth = 1.1 + along * 0.6;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = (0.42 + 0.4 * fade) * fade;
      ctx.fillStyle = `rgb(${toneR}, ${toneG}, ${toneB})`;
      drawSparkle(ctx, shooting.x, shooting.y, 3.4 * fade + 1.2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function paint(time: number) {
      ctx.fillStyle = dark ? "#0d1524" : "#f3f6fb";
      ctx.fillRect(0, 0, width, height);

      drawCursorAura();
      drawStars(time);
      if (!reducedMotion) drawShootingStar();
      drawWave(time);
    }

    function stopLoop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function tick(now: number) {
      if (!visible || document.hidden || reducedMotion) {
        raf = 0;
        return;
      }

      if (start === null) start = now;
      const time = (now - start) / 1000;

      // Faster tracking = more sensitive interaction
      pointer += (targetPointer - pointer) * 0.16;
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;

      if (!shooting && time >= nextShootAt) {
        shooting = spawnShootingStar();
      }
      if (shooting) {
        if (!shooting.fading) {
          shooting.life += 1;
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.trail.push({ x: shooting.x, y: shooting.y });
          if (shooting.trail.length > 24) shooting.trail.shift();

          const offscreen =
            shooting.x < -40 ||
            shooting.x > width + 40 ||
            shooting.y > height * 0.55 ||
            shooting.life > shooting.maxLife;
          if (offscreen) shooting.fading = true;
        } else {
          shooting.life += 1;
          shooting.x += shooting.vx * 0.35;
          shooting.y += shooting.vy * 0.35;
          shooting.fade *= 0.91;
          if (shooting.life % 2 === 0 && shooting.trail.length > 0) {
            shooting.trail.shift();
          }
          if (shooting.fade < 0.03) {
            shooting = null;
            nextShootAt = time + 8 + Math.random() * 9;
          }
        }
      }

      paint(time);
      raf = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (raf || reducedMotion) return;
      raf = requestAnimationFrame(tick);
    }

    function onMotionChange() {
      reducedMotion = motionQuery.matches;
      shooting = null;
      if (reducedMotion) {
        stopLoop();
        paint(1.15);
      } else if (visible && !document.hidden) {
        startLoop();
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (reducedMotion || event.pointerType !== "mouse" || width === 0) return;
      if (
        event.target instanceof Element &&
        event.target.closest("header, .theme-toggle")
      ) {
        targetPointer = 0;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      targetPointer = 1;
    }

    function onPointerLeave() {
      targetPointer = 0;
    }

    resize();
    cursorX = width * 0.5;
    cursorY = height * 0.35;
    mouseX = cursorX;
    mouseY = cursorY;
    paint(1.15);
    motionQuery.addEventListener("change", onMotionChange);

    const themeObserver = new MutationObserver(() => {
      dark = isDarkTheme();
      if (reducedMotion || !raf) paint(1.15);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotion) paint(1.15);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (visible) startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    hero?.addEventListener("pointermove", onPointerMove);
    hero?.addEventListener("pointerleave", onPointerLeave);

    if (!reducedMotion) startLoop();

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      hero?.removeEventListener("pointermove", onPointerMove);
      hero?.removeEventListener("pointerleave", onPointerLeave);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      className="home-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="home-atmosphere-veil-x" />
      <div className="home-atmosphere-veil-y" />
      <HeroCelestial />
      <div className="home-hero-wave-fade" />
    </div>
  );
}
