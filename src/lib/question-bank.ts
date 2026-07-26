/**
 * Configuration for every exam the admin panel can manage.
 *
 * Adding a future exam only requires appending an entry here — the admin forms,
 * filters, and dashboard all read from this list. Sections and groups are only
 * suggestions: the form lets an admin type any value.
 */

export type ExamSectionConfig = {
  /** Stable slug used in the database `exam_type` column. */
  slug: string;
  name: string;
  description: string;
  /** Suggested `section` values. */
  sections: string[];
  /** Suggested `group_key` values with readable labels. */
  groups: { key: string; label: string }[];
  /** Answer choice labels used by this exam. */
  choiceLabels: string[];
};

export const SAT_CHOICE_LABELS = ["A", "B", "C", "D"];
export const DIM_CHOICE_LABELS = ["A", "B", "C", "D", "E"];

export const EXAM_SECTION_CONFIGS: ExamSectionConfig[] = [
  {
    slug: "sat",
    name: "SAT",
    description: "Reading & Writing and Math practice exams.",
    sections: ["Reading and Writing", "Math"],
    groups: Array.from({ length: 10 }, (_, index) => ({
      key: `exam-${index + 1}`,
      label: `SAT Practice Exam ${index + 1}`,
    })),
    choiceLabels: SAT_CHOICE_LABELS,
  },
  {
    slug: "toefl",
    name: "TOEFL",
    description: "Reading, Listening, Speaking, and Writing practice.",
    sections: ["Reading", "Listening", "Speaking", "Writing"],
    groups: Array.from({ length: 5 }, (_, index) => ({
      key: `test-${index + 1}`,
      label: `TOEFL Practice Test ${index + 1}`,
    })),
    choiceLabels: SAT_CHOICE_LABELS,
  },
  {
    slug: "dim",
    name: "DIM",
    description: "Buraxılış and Blok preparation by chapter and sınaq.",
    sections: [
      "Buraxılış — Riyaziyyat",
      "Buraxılış — Azərbaycan dili",
      "Buraxılış — İngilis dili",
      "Blok",
    ],
    groups: [
      { key: "chapter-1", label: "1. Natural ədədlər" },
      { key: "chapter-37", label: "Sınaq 10 - Qəbul" },
    ],
    choiceLabels: DIM_CHOICE_LABELS,
  },
];

export function getExamConfig(slug: string): ExamSectionConfig | undefined {
  return EXAM_SECTION_CONFIGS.find((config) => config.slug === slug);
}

export function getExamName(slug: string): string {
  return getExamConfig(slug)?.name ?? slug.toUpperCase();
}

export function getChoiceLabels(slug: string): string[] {
  return getExamConfig(slug)?.choiceLabels ?? SAT_CHOICE_LABELS;
}

/** Turn any free-text set name into a stable slug for `group_key`. */
export function toGroupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
