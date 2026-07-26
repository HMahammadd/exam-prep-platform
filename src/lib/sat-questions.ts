import type { SatChoiceLabel, SatQuestion } from "@/types/sat-exam";
import { SAT_EXAM_1_QUESTIONS } from "./sat-exam-1-questions";

const SECTION = "Section 1: Reading and Writing";

const PASSAGE_POOL = [
  `Maya opened her notebook at the campus greenhouse and recorded how bean seedlings responded to different amounts of sunlight. She measured stem height every morning for two weeks and noted which plants developed the strongest leaves. Her classmates assumed the sunniest shelf would always produce the best results, but Maya wanted evidence before drawing conclusions.`,
  `The town library launched a weekend program inviting residents to repair broken household items instead of throwing them away. Volunteers taught visitors how to fix lamps, mend chair legs, and replace loose buttons on coats. Within a month, the program kept dozens of objects out of the landfill and helped neighbors share practical skills.`,
  `During the robotics club's final trial, the team discovered that their sensor readings became unreliable whenever the wheels crossed a dark floor mat. Rather than rewriting the entire program, they adjusted the calibration settings and tested the robot along several different paths.`,
  `A travel writer described a coastal village where fishermen and artists began cooperating after a storm damaged the harbor wall. The fishermen supplied fresh materials, while artists organized a fundraiser that attracted visitors from nearby cities. The partnership strengthened the local economy and repaired public infrastructure.`,
  `In her history essay, Priya compared two reformers who used letters, speeches, and community meetings to call for safer working conditions. She argued that lasting change required both public pressure and practical policy proposals that officials could implement.`,
];

const QUESTION_TEMPLATES: {
  questionText: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}[] = [
  {
    questionText: "Which choice best states the main purpose of the passage?",
    choices: [
      "To argue that one method is always superior",
      "To describe an investigation or effort supported by observation",
      "To criticize a community for refusing to change",
      "To summarize an unrelated historical event",
    ],
    correctIndex: 1,
    explanation:
      "The passage focuses on a deliberate effort supported by observation, measurement, or cooperation.",
  },
  {
    questionText:
      "Based on the passage, what can be reasonably inferred about the central subject?",
    choices: [
      "They avoid collecting information before acting",
      "They value evidence, collaboration, or careful testing",
      "They have already completed every possible experiment",
      "They oppose any change to current practices",
    ],
    correctIndex: 1,
    explanation:
      "The subject gathers information, tests ideas, or works with others before reaching conclusions.",
  },
  {
    questionText: "Which choice best describes the structure of the passage?",
    choices: [
      "A problem is introduced and a response is described",
      "Two unrelated timelines are compared without connection",
      "A definition is given and then disproved",
      "A list of rules is presented in random order",
    ],
    correctIndex: 0,
    explanation:
      "The passage typically presents a situation and then explains how people responded to it.",
  },
  {
    questionText:
      "Which word would best replace the idea of careful observation in context?",
    choices: ["recklessness", "monitoring", "secrecy", "abandonment"],
    correctIndex: 1,
    explanation:
      "Monitoring matches the passage's emphasis on tracking results over time.",
  },
  {
    questionText: "The author would most likely agree with which statement?",
    choices: [
      "Evidence should guide decisions",
      "First impressions are always sufficient",
      "Community efforts rarely matter",
      "Measurement makes problems worse",
    ],
    correctIndex: 0,
    explanation: "The passage supports thoughtful, evidence-based action.",
  },
  {
    questionText:
      "Which choice provides the most logical transition between ideas in a passage like this?",
    choices: ["Nevertheless,", "Consequently,", "Randomly,", "Never,"],
    correctIndex: 1,
    explanation:
      "Consequently signals a result that follows from earlier actions or findings.",
  },
  {
    questionText: "Which revision best maintains a formal academic tone?",
    choices: [
      "The data totally proves everything immediately.",
      "The results suggest a pattern worth further study.",
      "Nobody cares about the results anyway.",
      "The experiment was boring and useless.",
    ],
    correctIndex: 1,
    explanation:
      "A formal tone uses measured language such as suggest and worth further study.",
  },
  {
    questionText:
      "Which choice most effectively combines the ideas into one sentence?",
    choices: [
      "The team tested the robot, and they changed the calibration.",
      "After identifying unreliable readings, the team adjusted the calibration and retested the robot.",
      "The robot had wheels, and the floor had mats.",
      "Testing happened, and changes happened too.",
    ],
    correctIndex: 1,
    explanation:
      "The combined sentence clearly links the problem and the response.",
  },
  {
    questionText:
      "Which detail from the passage best supports the idea of community benefit?",
    choices: [
      "An individual refuses to participate",
      "Neighbors share skills or resources to solve a shared problem",
      "A machine malfunctions without explanation",
      "A writer invents fictional characters",
    ],
    correctIndex: 1,
    explanation:
      "Community benefit appears when people share skills or resources for a common goal.",
  },
  {
    questionText: "Which choice best clarifies the pronoun reference?",
    choices: [
      "They fixed it quickly.",
      "The volunteers fixed the broken lamps quickly.",
      "It was done by them.",
      "That one was repaired.",
    ],
    correctIndex: 1,
    explanation: "Naming the volunteers and the lamps removes ambiguity.",
  },
  {
    questionText:
      "Which word most nearly means practical as used in the passage?",
    choices: ["useful", "mysterious", "temporary", "decorative"],
    correctIndex: 0,
    explanation: "Practical aligns with useful and action-oriented outcomes.",
  },
  {
    questionText: "Which concluding sentence best summarizes the passage?",
    choices: [
      "Therefore, careful effort can lead to meaningful improvement.",
      "Therefore, no one should ever measure anything.",
      "Therefore, the topic is impossible to understand.",
      "Therefore, evidence should always be ignored.",
    ],
    correctIndex: 0,
    explanation:
      "The best summary reflects improvement through careful effort.",
  },
  {
    questionText: "Which choice uses punctuation correctly?",
    choices: [
      "Maya recorded the results, she compared them daily.",
      "Maya recorded the results and compared them daily.",
      "Maya recorded the results comparing them daily.",
      "Maya, recorded the results and compared them daily.",
    ],
    correctIndex: 1,
    explanation:
      "Two related actions can be joined with and without a comma splice.",
  },
  {
    questionText:
      "Which choice best preserves the meaning of the underlined idea: sought reliable information?",
    choices: [
      "ignored every measurement",
      "looked for dependable evidence",
      "avoided all testing",
      "rejected every observation",
    ],
    correctIndex: 1,
    explanation:
      "Looked for dependable evidence matches sought reliable information.",
  },
  {
    questionText: "Which choice creates the most precise sentence?",
    choices: [
      "The program helped people fix stuff.",
      "The repair program helped residents restore broken household items.",
      "The program was about things and people.",
      "There was a program and it happened.",
    ],
    correctIndex: 1,
    explanation:
      "The precise sentence identifies who was helped and what was restored.",
  },
  {
    questionText: "Which choice best introduces a contrasting viewpoint?",
    choices: ["Similarly,", "However,", "Therefore,", "Finally,"],
    correctIndex: 1,
    explanation: "However introduces contrast between expectations and findings.",
  },
  {
    questionText: "Which statement is best supported by the passage?",
    choices: [
      "Change can result from sustained effort",
      "All experiments fail equally",
      "Measurement is unnecessary",
      "Cooperation always causes conflict",
    ],
    correctIndex: 0,
    explanation:
      "The passages consistently show improvement through sustained effort.",
  },
  {
    questionText: "Which choice uses the correct verb form?",
    choices: [
      "The team were testing the sensor.",
      "The team was testing the sensor.",
      "The team are testing the sensor.",
      "The team be testing the sensor.",
    ],
    correctIndex: 1,
    explanation: "Team is a collective noun treated as singular: was testing.",
  },
  {
    questionText: "Which choice most effectively establishes the writer's claim?",
    choices: [
      "Lasting change requires both public engagement and workable policy.",
      "History is confusing and impossible to study.",
      "Every reformer succeeded without effort.",
      "Letters and speeches never influence anyone.",
    ],
    correctIndex: 0,
    explanation:
      "The claim matches the essay's focus on engagement and practical policy.",
  },
  {
    questionText:
      "Which choice best completes the sentence with logical precision?",
    choices: [
      "because the evidence was ignored",
      "because the findings supported a revised approach",
      "although no one participated",
      "unless measurement was forbidden",
    ],
    correctIndex: 1,
    explanation:
      "A revised approach follows naturally when findings support it.",
  },
];

const LABELS: SatChoiceLabel[] = ["A", "B", "C", "D"];

function buildDemoQuestion(
  examId: number,
  index: number,
  template: (typeof QUESTION_TEMPLATES)[number]
): SatQuestion {
  const passage = PASSAGE_POOL[index % PASSAGE_POOL.length];

  return {
    id: `exam-${examId}-q-${index + 1}`,
    examId,
    section: SECTION,
    passage,
    questionText: template.questionText,
    choices: template.choices.map((text, choiceIndex) => ({
      label: LABELS[choiceIndex],
      text,
    })),
    correctAnswer: LABELS[template.correctIndex],
    explanation: template.explanation,
  };
}

export function getExamQuestions(examId: number): SatQuestion[] {
  if (examId === 1) {
    return SAT_EXAM_1_QUESTIONS;
  }

  if (examId === 2 || examId === 3) {
    return QUESTION_TEMPLATES.map((template, index) =>
      buildDemoQuestion(examId, index, template)
    );
  }

  return [];
}

export function getQuestionById(questionId: string): SatQuestion | undefined {
  const match = questionId.match(/^exam-(\d+)-q-/);
  if (!match) {
    return undefined;
  }

  const examId = Number(match[1]);
  return getExamQuestions(examId).find((question) => question.id === questionId);
}
