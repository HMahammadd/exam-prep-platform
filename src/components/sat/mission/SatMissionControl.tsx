"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MissionBriefing } from "@/components/sat/mission/MissionBriefing";
import { MissionRocket } from "@/components/sat/mission/MissionRocket";
import {
  SatMissionCard,
  type MissionState,
} from "@/components/sat/mission/SatMissionCard";
import { loadSatExamNotes, saveSatExamNote } from "@/lib/sat-exam-notes";
import {
  loadSatExamProgress,
  type SatExamProgress,
} from "@/lib/sat-exam-progress";
import { loadLocalExamSummaries } from "@/lib/sat-local-attempt";
import type {
  SatExamAttemptSummary,
  SatPracticeExam,
} from "@/types/sat-exam";

type SatMissionControlProps = {
  exams: SatPracticeExam[];
  /** `null` while the attempt query streams; the journey renders either way. */
  serverSummaries: Record<string, SatExamAttemptSummary> | null;
};

/**
 * The exam journey.
 *
 * Three sources are merged here, all of which already existed: attempts from
 * the server, attempts saved locally when the SAT tables are absent, and the
 * unfinished session the exam interface keeps. Everything browser-only is read
 * after mount so the server and first client render agree.
 */
export function SatMissionControl({
  exams,
  serverSummaries,
}: SatMissionControlProps) {
  const [localSummaries, setLocalSummaries] = useState<
    Record<string, SatExamAttemptSummary>
  >({});
  const [progress, setProgress] = useState<Record<string, SatExamProgress>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  // localStorage/sessionStorage can only be read after mount, which is exactly
  // what this rule warns about; the same exemption the SAT shell uses.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const local = loadLocalExamSummaries();
    const mapped: Record<string, SatExamAttemptSummary> = {};
    for (const [examId, entry] of Object.entries(local)) {
      mapped[examId] = { ...entry };
    }
    setLocalSummaries(mapped);
    setNotes(loadSatExamNotes());

    const openExams: Record<string, SatExamProgress> = {};
    for (const exam of exams) {
      const found = loadSatExamProgress(exam.id);
      if (found) openExams[String(exam.id)] = found;
    }
    setProgress(openExams);
  }, [exams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSaveNote = useCallback((examId: number, note: string) => {
    setNotes(saveSatExamNote(examId, note));
  }, []);

  const rows = useMemo(() => {
    return exams.map((exam) => {
      const key = String(exam.id);
      const server = serverSummaries?.[key];
      const local = localSummaries[key];

      // Newest attempt wins for "last", highest for "best" — the same rule the
      // exam list used before.
      let summary: SatExamAttemptSummary | undefined = server ?? local;
      if (server && local) {
        const localNewer =
          !server.lastCompletedAt ||
          (local.lastCompletedAt ?? "") > server.lastCompletedAt;
        const localBest =
          server.bestScore === null ||
          (local.bestScore ?? 0) > server.bestScore;
        summary = {
          lastScore: localNewer ? local.lastScore : server.lastScore,
          lastTotal: localNewer ? local.lastTotal : server.lastTotal,
          bestScore: localBest ? local.bestScore : server.bestScore,
          bestTotal: localBest ? local.bestTotal : server.bestTotal,
          lastCompletedAt: localNewer
            ? local.lastCompletedAt
            : server.lastCompletedAt,
          lastAttemptId: localNewer
            ? local.lastAttemptId
            : server.lastAttemptId,
        };
      }

      const open = progress[key] ?? null;
      const hasAttempt =
        summary?.lastScore !== null && summary?.lastScore !== undefined;

      let state: MissionState = "not-started";
      if (exam.status !== "available") {
        state = "coming-soon";
      } else if (hasAttempt) {
        state = "completed";
      } else if (open) {
        state = "in-progress";
      }

      return { exam, state, summary, open };
    });
  }, [exams, serverSummaries, localSummaries, progress]);

  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let best: { score: number; total: number } | null = null;

    for (const { state, summary } of rows) {
      if (state === "completed") completed += 1;
      if (state === "in-progress") inProgress += 1;
      if (
        summary?.bestScore !== null &&
        summary?.bestScore !== undefined &&
        summary.bestTotal
      ) {
        if (!best || summary.bestScore > best.score) {
          best = { score: summary.bestScore, total: summary.bestTotal };
        }
      }
    }

    return { completed, inProgress, best };
  }, [rows]);

  /**
   * The rocket marks where the journey currently stands: an open exam if
   * there is one, otherwise the next runnable exam after the last completed
   * one, falling back to the last completed exam when the list is finished.
   */
  const rocketIndex = useMemo(() => {
    const open = rows.findIndex((row) => row.state === "in-progress");
    if (open !== -1) return open;

    let lastCompleted = -1;
    rows.forEach((row, index) => {
      if (row.state === "completed") lastCompleted = index;
    });

    if (lastCompleted === -1) {
      return rows.findIndex((row) => row.state !== "coming-soon");
    }

    const next = rows.findIndex(
      (row, index) => index > lastCompleted && row.state !== "coming-soon"
    );
    return next === -1 ? lastCompleted : next;
  }, [rows]);

  return (
    <>
      {/* First visit only; it manages its own stored preference. */}
      <MissionBriefing />

      <dl className="sat-mission-stats">
        <div>
          <dd>{stats.completed}</dd>
          <dt>completed</dt>
        </div>
        <div>
          <dd>{stats.inProgress}</dd>
          <dt>in progress</dt>
        </div>
        <div>
          <dd>
            {stats.best ? `${stats.best.score} / ${stats.best.total}` : "—"}
          </dd>
          <dt>best score</dt>
        </div>
      </dl>

      <ol className="sat-mission-path">
        {rows.map(({ exam, state, summary, open }, index) => (
          <li
            key={exam.id}
            className="sat-mission-step"
            data-state={state}
            data-current={index === rocketIndex ? "true" : undefined}
          >
            <span className="sat-mission-checkpoint" aria-hidden>
              <span className="sat-mission-node" />
              {index === rocketIndex ? <MissionRocket /> : null}
            </span>

            <SatMissionCard
              exam={exam}
              index={index}
              state={state}
              summary={summary}
              progress={open}
              note={notes[String(exam.id)] ?? ""}
              onSaveNote={handleSaveNote}
            />
          </li>
        ))}
      </ol>
    </>
  );
}
