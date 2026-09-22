"use client";

import { ArrowRight, BarChart3, Clock, FileText, Target, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MissionScene } from "@/components/sat/mission/MissionScene";
import {
  dismissBriefingForever,
  shouldShowBriefing,
  snoozeBriefing,
} from "@/lib/sat-briefing";

/** Drop the briefing artwork here to replace the drawn fallback. */
const BRIEFING_ART = "/brief/mission-briefing.png";

const FACTS = [
  {
    icon: FileText,
    title: "54 questions",
    detail: "Full-length exam",
  },
  {
    icon: Clock,
    title: "Timed exam experience",
    detail: "Real test conditions",
  },
  {
    icon: BarChart3,
    title: "Real test-style structure",
    detail: "Same section format",
  },
  {
    icon: Target,
    title: "Progress tracking",
    detail: "See your improvement",
  },
];

/**
 * First-visit briefing for SAT Practice Exams.
 *
 * One component for both modes — every surface, rule and accent is a theme
 * token, so Day reads as a bright observatory and Night as mission control
 * without a second markup path.
 */
export function MissionBriefing() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [remember, setRemember] = useState(false);
  const [artOk, setArtOk] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);

  // Storage is readable only after mount, so the first paint never flashes it.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (shouldShowBriefing()) {
      openerRef.current = document.activeElement;
      setOpen(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const close = useCallback(
    (permanent: boolean) => {
      if (permanent) {
        dismissBriefingForever();
      } else {
        snoozeBriefing();
      }

      // Let the exit animation run before unmounting.
      setClosing(true);
      window.setTimeout(() => {
        setOpen(false);
        setClosing(false);
        (openerRef.current as HTMLElement | null)?.focus?.();
      }, 170);
    },
    []
  );

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(remember);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, close, remember]);

  if (!open) return null;

  return (
    <div
      className={`brief-scrim${closing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close(remember);
      }}
    >
      <div
        ref={panelRef}
        className="brief"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-title"
        aria-describedby="brief-body"
        tabIndex={-1}
      >
        <button
          type="button"
          className="brief-close"
          onClick={() => close(remember)}
          aria-label="Close briefing"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {/* —— left: the briefing —— */}
        <div className="brief-copy">
          <p className="brief-eyebrow">
            Mission briefing
            <span className="brief-eyebrow-rule" aria-hidden />
          </p>

          <h2 id="brief-title" className="brief-title">
            Welcome, Pilot.
          </h2>

          <div id="brief-body" className="brief-lede">
            <p>
              You are about to enter a full-length Digital SAT simulation built
              to reflect real test conditions.
            </p>
            <p>
              Stay focused, manage your time wisely, and track your progress as
              you move through each mission.
            </p>
          </div>

          <ul className="brief-facts">
            {FACTS.map(({ icon: Icon, title, detail }) => (
              <li key={title}>
                <Icon className="brief-fact-icon" aria-hidden />
                <div>
                  <p className="brief-fact-title">{title}</p>
                  <p className="brief-fact-detail">{detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <figure className="brief-quote">
            <blockquote>
              “Discipline today,
              <br />
              freedom tomorrow.”
            </blockquote>
            <figcaption>— Keplerly</figcaption>
          </figure>

          <label className="brief-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Don&apos;t show this again</span>
          </label>
        </div>

        {/* —— right: the view —— */}
        <div className="brief-visual">
          <div className="brief-stage">
            {/*
              The artwork is a supplied asset. Until it exists the drawn scene
              below shows through, so the modal is never broken — and if the
              file is added later nothing else has to change.
            */}
            <MissionScene />

            {artOk ? (
              <Image
                className="brief-photo"
                src={BRIEFING_ART}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                priority
                onError={() => setArtOk(false)}
              />
            ) : (
              <>
                <p className="brief-visual-line">
                  A higher score is a brighter you.
                </p>
                <p className="brief-visual-mark" aria-hidden>
                  Keplerly
                </p>
              </>
            )}
            {/*
              The single action sits on the artwork rather than on a band
              beneath it: the band cut the panel in two and fought the image.
              A scrim behind it keeps the label legible over the starfield.
            */}
            <div className="brief-actions">
              <button
                type="button"
                className="brief-primary"
                onClick={() => close(true)}
              >
                Begin Mission
                <ArrowRight className="brief-primary-arrow h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
