"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { X } from "lucide-react";
import { saveStudyGoal } from "@/app/dashboard/(shell)/sat/daily-mission-actions";
import {
  INTENSITY_LABELS,
  INTENSITY_TARGETS,
  estimateMinutes,
} from "@/lib/daily-mission";
import { MISSION_INTENSITIES, type MissionIntensity } from "@/types/daily-mission";

function intensitySummary(intensity: MissionIntensity) {
  const targets = INTENSITY_TARGETS[intensity];
  const questions = targets.warmup + targets.focus + targets.mistakes;
  return `${questions} questions + ${targets.vocabulary} words · ~${estimateMinutes(targets)} min`;
}

/** Mounted only while open, so its form always starts from the saved goal. */
export function AdjustGoalDialog({
  onClose,
  onSaved,
  today,
  examDate,
  intensity,
}: {
  onClose: () => void;
  onSaved: () => void;
  today: string;
  examDate: string | null;
  intensity: MissionIntensity;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(examDate ?? "");
  const [level, setLevel] = useState<MissionIntensity>(intensity);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveStudyGoal({ examDate: date || null, intensity: level });
      if (!result.success) {
        setError(result.error ?? "Couldn’t save your goal.");
        return;
      }
      onSaved();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="op-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Backdrop click: the dialog element itself is the backdrop target.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <form className="op-dialog-body" onSubmit={submit}>
        <header className="op-dialog-head">
          <h2 id={titleId}>Adjust your goal</h2>
          <button type="button" className="op-icon-btn" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <label className="op-field">
          <span className="op-field-label">SAT test date</span>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(event) => setDate(event.target.value)}
            className="op-input"
          />
          <span className="op-field-hint">Used for the countdown. Leave empty if you haven&apos;t booked yet.</span>
        </label>

        <fieldset className="op-field">
          <legend className="op-field-label">Daily mission size</legend>
          <div className="op-intensity">
            {MISSION_INTENSITIES.map((option) => (
              <label key={option} className={`op-intensity-option${level === option ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="intensity"
                  value={option}
                  checked={level === option}
                  onChange={() => setLevel(option)}
                />
                <span className="op-intensity-name">{INTENSITY_LABELS[option]}</span>
                <span className="op-intensity-detail">{intensitySummary(option)}</span>
              </label>
            ))}
          </div>
          <span className="op-field-hint">Applies to today straight away. Finished work is always kept.</span>
        </fieldset>

        {error ? (
          <p className="op-dialog-error" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="op-dialog-foot">
          <button type="button" className="op-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="op-btn-primary is-sm" disabled={pending}>
            {pending ? "Saving…" : "Save goal"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
