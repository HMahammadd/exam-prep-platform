import type { SatModuleNumber, SatQuestion } from "@/types/sat-exam";

export type SatReviewAnswer = {
  id: string;
  question_id: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
};

export type ReviewStatus = "correct" | "wrong" | "missed";

export type ReviewSectionKey = "verbal" | "math";

export type ReviewQuestionItem = {
  answer: SatReviewAnswer;
  question: SatQuestion;
  status: ReviewStatus;
  moduleNumber: SatModuleNumber;
  questionNumber: number;
  section: ReviewSectionKey;
};

export type ReviewModuleGroup = {
  module: SatModuleNumber;
  items: ReviewQuestionItem[];
  correctCount: number;
  total: number;
};

export type ReviewSectionGroup = {
  key: ReviewSectionKey;
  label: string;
  modules: ReviewModuleGroup[];
};

export function getReviewStatus(answer: SatReviewAnswer): ReviewStatus {
  if (answer.selected_answer == null || answer.selected_answer === "") {
    return "missed";
  }
  return answer.is_correct ? "correct" : "wrong";
}

export function sectionKeyFromQuestion(question: SatQuestion): ReviewSectionKey {
  return question.section.toLowerCase().includes("math") ? "math" : "verbal";
}

function emptyModules(): ReviewModuleGroup[] {
  return [
    { module: 1, items: [], correctCount: 0, total: 0 },
    { module: 2, items: [], correctCount: 0, total: 0 },
  ];
}

export function buildReviewSections(
  answers: SatReviewAnswer[],
  examQuestions: SatQuestion[]
): ReviewSectionGroup[] {
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.question_id, answer])
  );

  const sections: Record<ReviewSectionKey, ReviewModuleGroup[]> = {
    verbal: emptyModules(),
    math: emptyModules(),
  };

  // Prefer exam bank order so module grids follow question numbers.
  for (const question of examQuestions) {
    const answer = answerByQuestionId.get(question.id);
    if (!answer) {
      continue;
    }

    const section = sectionKeyFromQuestion(question);
    const moduleIndex = question.module === 1 ? 0 : 1;
    const moduleGroup = sections[section][moduleIndex];
    const questionNumber = moduleGroup.items.length + 1;

    moduleGroup.items.push({
      answer,
      question,
      status: getReviewStatus(answer),
      moduleNumber: question.module,
      questionNumber,
      section,
    });
  }

  for (const section of Object.values(sections)) {
    for (const moduleGroup of section) {
      moduleGroup.total = moduleGroup.items.length;
      moduleGroup.correctCount = moduleGroup.items.filter(
        (item) => item.status === "correct"
      ).length;
    }
  }

  return [
    { key: "verbal", label: "Verbal", modules: sections.verbal },
    { key: "math", label: "Math", modules: sections.math },
  ];
}

export function getDefaultSelectedQuestionId(
  sections: ReviewSectionGroup[]
): string | null {
  const verbalModule1 = sections
    .find((section) => section.key === "verbal")
    ?.modules.find((module) => module.module === 1);

  if (verbalModule1?.items[0]) {
    return verbalModule1.items[0].question.id;
  }

  for (const section of sections) {
    for (const moduleGroup of section.modules) {
      if (moduleGroup.items[0]) {
        return moduleGroup.items[0].question.id;
      }
    }
  }

  return null;
}

export function findReviewItem(
  sections: ReviewSectionGroup[],
  questionId: string
): ReviewQuestionItem | null {
  for (const section of sections) {
    for (const moduleGroup of section.modules) {
      const match = moduleGroup.items.find(
        (item) => item.question.id === questionId
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
}

/** Flat list in exam order: Verbal M1 → M2 → Math M1 → M2. */
export function flattenReviewItems(
  sections: ReviewSectionGroup[]
): ReviewQuestionItem[] {
  return sections.flatMap((section) =>
    section.modules.flatMap((moduleGroup) => moduleGroup.items)
  );
}
