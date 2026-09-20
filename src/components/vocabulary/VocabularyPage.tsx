"use client";

import { BookMarked, BookOpen } from "lucide-react";
import { useState } from "react";
import { VocabularyTable } from "@/components/vocabulary/VocabularyTable";
import type { VocabularyUserState, VocabularyWord } from "@/types/vocabulary";

type Tab = "our" | "your";

export function VocabularyPage({
  words,
  initialState,
}: {
  words: VocabularyWord[];
  initialState: VocabularyUserState;
}) {
  const [tab, setTab] = useState<Tab>("our");

  return (
    <div>
      <div className="vocab-tabs" role="tablist" aria-label="Vocabulary lists">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "our"}
          className={`vocab-tab${tab === "our" ? " is-active" : ""}`}
          onClick={() => setTab("our")}
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Our Words
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "your"}
          className={`vocab-tab${tab === "your" ? " is-active" : ""}`}
          onClick={() => setTab("your")}
        >
          <BookMarked className="h-4 w-4" aria-hidden />
          Your Words
        </button>
      </div>

      <p className="vocab-description">
        Review essential vocabulary words and their meanings. Save words, add
        your own notes, and personalize your study experience.
      </p>

      {tab === "our" ? (
        <VocabularyTable words={words} initialState={initialState} />
      ) : (
        <div className="vocab-empty-state">
          <BookMarked className="h-6 w-6" aria-hidden />
          <p>Your saved vocabulary will appear here.</p>
        </div>
      )}
    </div>
  );
}
