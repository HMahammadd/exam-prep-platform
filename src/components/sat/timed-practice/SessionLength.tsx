"use client";

import { useId } from "react";
import { formatClock } from "@/lib/timed-practice";
import {
  TIMED_DURATION_IDS,
  type TimedDurationId,
  type TimedFocusId,
} from "@/types/timed-practice";
import { useTimedCopy } from "./useTimedCopy";

/*
 * Orbit geometry, in CSS px: a circle of radius R whose top 139° shows above
 * the clock. The left half is the dashed approach, the right half the drawn
 * path; the marker travels the right half as the session gets longer.
 */
const R = 175;
const WIDTH = 340;
const TOP = 6;
const CX = WIDTH / 2;
const CY = TOP + R;
const SWEEP = 69.5;
const END_X = R * Math.sin((SWEEP * Math.PI) / 180);
const END_Y = CY - R * Math.cos((SWEEP * Math.PI) / 180);
const HEIGHT = Math.ceil(END_Y + 5);
/** The longest session (a full Math section) puts the marker at the end of the path. */
const LONGEST_MINUTES = 70;

function OrbitArc({ minutes }: { minutes: number }) {
  // Square root keeps the short sessions apart instead of bunching near the top.
  const angle = SWEEP * Math.sqrt(Math.min(minutes, LONGEST_MINUTES) / LONGEST_MINUTES);

  return (
    <svg
      className="tp-orbit"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden
      focusable="false"
    >
      <path
        className="tp-orbit-trail"
        d={`M ${CX - END_X} ${END_Y} A ${R} ${R} 0 0 1 ${CX} ${TOP}`}
      />
      <path
        className="tp-orbit-path"
        d={`M ${CX} ${TOP} A ${R} ${R} 0 0 1 ${CX + END_X} ${END_Y}`}
      />
      <circle className="tp-orbit-end" cx={CX + END_X} cy={END_Y} r={3.5} />
      <g
        className="tp-orbit-marker"
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${CX}px ${CY}px` }}
      >
        <circle cx={CX} cy={TOP} r={5.5} />
      </g>
    </svg>
  );
}

export function SessionLength({
  duration,
  focus,
  minutes,
  onChange,
}: {
  duration: TimedDurationId;
  focus: TimedFocusId;
  minutes: number;
  onChange: (duration: TimedDurationId) => void;
}) {
  const { tp } = useTimedCopy();
  const labelId = useId();
  const [clockMinutes, clockSeconds] = formatClock(minutes * 60).split(":");

  return (
    <section className="tp-length" aria-labelledby={labelId}>
      <h3 id={labelId} className="tp-label">
        {tp("sessionLength")}
      </h3>

      <div className="tp-timer">
        <OrbitArc minutes={minutes} />
        <p className="tp-clock">
          <span className="sr-only">{tp("sessionTime")}: </span>
          <span key={minutes} className="tp-fade">
            {clockMinutes}
            <span className="tp-clock-colon">:</span>
            {clockSeconds}
          </span>
        </p>
      </div>

      {/* Always rendered, so choosing Full section never shifts the layout. */}
      <p className="tp-timer-note">
        {duration === "full" ? tp(`fullSectionHint.${focus}`) : null}
      </p>

      <div className="tp-durations" role="radiogroup" aria-labelledby={labelId}>
        {TIMED_DURATION_IDS.map((id) => (
          <label key={id} className={`tp-duration${id === duration ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="tp-duration"
              className="tp-duration-input"
              checked={id === duration}
              onChange={() => onChange(id)}
            />
            <span>{tp(`durations.${id}`)}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
