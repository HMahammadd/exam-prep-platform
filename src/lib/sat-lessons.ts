export const SAT_LESSONS = [
  { slug: "words-in-context", title: "Words in Context" },
  { slug: "student-notes", title: "Student Notes" },
  { slug: "transitions", title: "Transitions" },
  {
    slug: "form-structure-and-sense",
    title: "Form, Structure, and Sense",
  },
  { slug: "boundaries", title: "Boundaries" },
  {
    slug: "text-structure-and-purpose",
    title: "Text Structure and Purpose",
  },
  { slug: "inferences", title: "Inferences" },
  { slug: "cross-text-connections", title: "Cross-Text Connections" },
  { slug: "command-of-evidence", title: "Command of Evidence" },
  { slug: "central-ideas-and-details", title: "Central Ideas and Details" },
] as const;

export type SatLesson = (typeof SAT_LESSONS)[number];

export function getSatLesson(slug: string): SatLesson | undefined {
  return SAT_LESSONS.find((lesson) => lesson.slug === slug);
}
