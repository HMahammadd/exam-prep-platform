"use client";

import { useId, useState } from "react";
import { ArrowRight, BookOpen, Calculator, Check, LayoutGrid, type LucideIcon } from "lucide-react";
import {
  SECTION_TOPICS,
  canSwitchTopicOff,
  isCustomized,
  isFocusAvailable,
  sectionsFor,
} from "@/lib/timed-practice";
import {
  TIMED_FOCUS_IDS,
  type TimedAvailability,
  type TimedFocusId,
  type TimedPracticeConfig,
  type TimedTopicId,
} from "@/types/timed-practice";
import { useTimedCopy } from "./useTimedCopy";

const FOCUS_ICONS: Record<TimedFocusId, LucideIcon> = {
  mixed: LayoutGrid,
  math: Calculator,
  "reading-writing": BookOpen,
};

function TopicPicker({
  config,
  availability,
  onToggleTopic,
  onResetTopics,
}: {
  config: TimedPracticeConfig;
  availability: TimedAvailability;
  onToggleTopic: (topic: TimedTopicId) => void;
  onResetTopics: () => void;
}) {
  const { tp } = useTimedCopy();
  const sections = sectionsFor(config.focus).filter((section) => availability[section].total > 0);

  return (
    <div className="tp-topics">
      {sections.map((section) => (
        <fieldset key={section} className="tp-topic-group">
          <legend className="tp-topic-legend">{tp(`sections.${section}`)}</legend>
          <div className="tp-topic-grid">
            {SECTION_TOPICS[section].map((topic) => {
              const on = config.topics.includes(topic);
              // The last topic left on in a section can't be switched off.
              const locked = on && !canSwitchTopicOff(config.topics, topic);
              return (
                <label key={topic} className={`tp-topic${locked ? " is-locked" : ""}`}>
                  <input
                    type="checkbox"
                    className="tp-check-input"
                    checked={on}
                    disabled={locked}
                    onChange={() => onToggleTopic(topic)}
                  />
                  <span className="tp-check-box" aria-hidden>
                    <Check strokeWidth={2.5} />
                  </span>
                  <span className="tp-topic-text">
                    <span className="tp-topic-name">{tp(`topics.${topic}.name`)}</span>
                    <span className="tp-topic-skills">{tp(`topics.${topic}.skills`)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="tp-topics-foot">
        <p className="tp-topics-hint">{tp("topicsHint")}</p>
        {isCustomized(config) ? (
          <button type="button" className="tp-link" onClick={onResetTopics}>
            {tp("useAllTopics")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PracticeFocus({
  config,
  availability,
  onFocus,
  onToggleTopic,
  onResetTopics,
}: {
  config: TimedPracticeConfig;
  availability: TimedAvailability;
  onFocus: (focus: TimedFocusId) => void;
  onToggleTopic: (topic: TimedTopicId) => void;
  onResetTopics: () => void;
}) {
  const { tp } = useTimedCopy();
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const panelId = `${baseId}-topics`;
  const [open, setOpen] = useState(false);

  return (
    <section className="tp-focus" aria-labelledby={labelId}>
      <h3 id={labelId} className="tp-label">
        {tp("practiceFocus")}
      </h3>

      <div className="tp-focus-list" role="radiogroup" aria-labelledby={labelId}>
        {TIMED_FOCUS_IDS.map((id) => {
          const Icon = FOCUS_ICONS[id];
          const available = isFocusAvailable(id, availability);
          const selected = id === config.focus;
          const descriptionId = `${baseId}-${id}`;
          return (
            <label
              key={id}
              className={`tp-focus-row${selected ? " is-selected" : ""}${available ? "" : " is-unavailable"}`}
            >
              <input
                type="radio"
                name="tp-focus"
                className="tp-radio"
                checked={selected}
                disabled={!available}
                onChange={() => onFocus(id)}
                aria-labelledby={`${descriptionId}-title`}
                aria-describedby={descriptionId}
              />
              <Icon className="tp-focus-icon" strokeWidth={1.5} aria-hidden />
              <span className="tp-focus-text">
                <span id={`${descriptionId}-title`} className="tp-focus-title">
                  {tp(`focus.${id}.title`)}
                </span>
                <span id={descriptionId} className="tp-focus-desc">
                  {tp(`focus.${id}.description`)}
                  {available ? null : <span className="sr-only">. {tp("comingSoonHint")}</span>}
                </span>
              </span>
              {available ? null : (
                <span className="tp-soon" title={tp("comingSoonHint")} aria-hidden>
                  {tp("comingSoon")}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <button
        type="button"
        className="tp-link tp-customize"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {tp("customizeTopics")}
        <ArrowRight className="tp-link-arrow" aria-hidden />
      </button>

      {/* Collapsed with CSS rather than unmounted, so it can ease open; inert keeps it out of the tab order. */}
      <div id={panelId} className={`tp-reveal${open ? " is-open" : ""}`} inert={!open}>
        <div className="tp-reveal-inner">
          <TopicPicker
            config={config}
            availability={availability}
            onToggleTopic={onToggleTopic}
            onResetTopics={onResetTopics}
          />
        </div>
      </div>
    </section>
  );
}
