"use client";

import { Pencil, Plus } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type SatExamNoteProps = {
  examId: number;
  examName: string;
  note: string;
  onSave: (examId: number, note: string) => void;
};

/**
 * A note belongs to its exam and is edited in place — there is no notes page
 * and no modal. Collapsed it is a single "Add note" affordance; saved it reads
 * as a quiet block under the results.
 */
export function SatExamNote({
  examId,
  examName,
  note,
  onSave,
}: SatExamNoteProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  // The draft is seeded when the editor opens rather than synced from an
  // effect, so the saved note is the single source of truth while closed.
  const open = () => {
    setDraft(note);
    setEditing(true);
  };

  useEffect(() => {
    if (editing) fieldRef.current?.focus();
  }, [editing]);

  // Grow the field with its content so the whole draft stays visible.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!editing || !field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight + field.offsetHeight - field.clientHeight}px`;
  }, [editing, draft]);

  const commit = () => {
    onSave(examId, draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(note);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="sat-note sat-note--editing">
        <p className="sat-note-label">Your note</p>
        <textarea
          ref={fieldRef}
          className="sat-note-field"
          value={draft}
          rows={3}
          maxLength={500}
          aria-label={`Note for ${examName}`}
          placeholder="What to review before the next attempt…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              commit();
            }
          }}
        />
        <div className="sat-note-actions">
          <button type="button" className="sat-note-save" onClick={commit}>
            Save note
          </button>
          <button type="button" className="sat-note-cancel" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <button
        type="button"
        className="sat-note-add"
        onClick={open}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add note
      </button>
    );
  }

  return (
    <div className="sat-note">
      <div className="sat-note-body">
        <p className="sat-note-label">Your note</p>
        <p className="sat-note-text">{note}</p>
      </div>
      <button
        type="button"
        className="sat-note-edit"
        onClick={open}
        aria-label={`Edit note for ${examName}`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </button>
    </div>
  );
}
