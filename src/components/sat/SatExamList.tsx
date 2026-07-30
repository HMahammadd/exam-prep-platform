"use client";

import { useEffect, useMemo, useState } from "react";
import { SatExamRow } from "@/components/sat/SatExamRow";
import {
  loadLocalExamSummaries,
  type LocalExamSummary,
} from "@/lib/sat-local-attempt";
import type {
  SatExamAttemptSummary,
  SatPracticeExam,
} from "@/types/sat-exam";

type SatExamListProps = {
  exams: SatPracticeExam[];
  serverSummaries: Record<string, SatExamAttemptSummary>;
};

function mergeSummaries(
  server: SatExamAttemptSummary | undefined,
  local: LocalExamSummary | undefined
): SatExamAttemptSummary | undefined {
  if (!server && !local) {
    return undefined;
  }

  if (!local) {
    return server;
  }

  if (!server) {
    return {
      lastScore: local.lastScore,
      lastTotal: local.lastTotal,
      bestScore: local.bestScore,
      bestTotal: local.bestTotal,
      lastCompletedAt: local.lastCompletedAt,
      lastAttemptId: local.lastAttemptId,
    };
  }

  const localIsNewer =
    !server.lastCompletedAt ||
    new Date(local.lastCompletedAt) > new Date(server.lastCompletedAt);

  const localIsBest =
    server.bestScore === null || local.bestScore > server.bestScore;

  return {
    lastScore: localIsNewer ? local.lastScore : server.lastScore,
    lastTotal: localIsNewer ? local.lastTotal : server.lastTotal,
    bestScore: localIsBest ? local.bestScore : server.bestScore,
    bestTotal: localIsBest ? local.bestTotal : server.bestTotal,
    lastCompletedAt: localIsNewer
      ? local.lastCompletedAt
      : server.lastCompletedAt,
    lastAttemptId: localIsNewer ? local.lastAttemptId : server.lastAttemptId,
  };
}

export function SatExamList({ exams, serverSummaries }: SatExamListProps) {
  const [localSummaries, setLocalSummaries] = useState<
    Record<string, LocalExamSummary>
  >({});

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLocalSummaries(loadLocalExamSummaries());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const summaries = useMemo(() => {
    const merged: Record<string, SatExamAttemptSummary> = {
      ...serverSummaries,
    };

    for (const [examId, localSummary] of Object.entries(localSummaries)) {
      const combined = mergeSummaries(serverSummaries[examId], localSummary);
      if (combined) {
        merged[examId] = combined;
      }
    }

    return merged;
  }, [localSummaries, serverSummaries]);

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <SatExamRow
          key={exam.id}
          exam={exam}
          summary={summaries[String(exam.id)]}
        />
      ))}
    </div>
  );
}
