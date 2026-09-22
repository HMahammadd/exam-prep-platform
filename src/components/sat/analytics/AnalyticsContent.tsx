import {
  ArrowRight,
  BarChart3,
  Clock,
  Grid3x3,
  LineChart,
  Sparkles,
  Table2,
  Target,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { AccuracyScatterLazy } from "@/components/sat/analytics/AccuracyScatterLazy";
import { OrbitArt } from "@/components/sat/progress/OrbitArt";
import type { ScatterPoint } from "@/components/sat/analytics/AccuracyScatter";

/**
 * DEMO — nothing backs per-question timing, per-topic accuracy or mistake
 * counts yet. Kept in one block, as on the Progress page, so what still needs
 * a table is obvious. The exam comparison below uses real attempts.
 */
const DEMO = {
  overallAccuracy: 79,
  accuracyDelta: 14,
  avgTime: "1m 18s",
  avgTimeDelta: "-22s",
  scoreGain: 180,
  scoreFrom: 1180,
  scoreTo: 1360,
  sections: [
    {
      name: "Reading & Writing",
      score: 690,
      topics: [
        { label: "Information & Ideas", value: 82 },
        { label: "Craft & Structure", value: 76 },
        { label: "Expression of Ideas", value: 71 },
        { label: "Standard English Conventions", value: 68 },
      ],
    },
    {
      name: "Math",
      score: 670,
      topics: [
        { label: "Algebra", value: 88 },
        { label: "Advanced Math", value: 61 },
        { label: "Problem Solving & Data Analysis", value: 73 },
        { label: "Geometry & Trigonometry", value: 81 },
      ],
    },
  ],
  losses: [
    { count: 7, label: "Advanced Algebra", share: 18 },
    { count: 5, label: "Words in Context", share: 13 },
    { count: 4, label: "Text Transitions", share: 10 },
    { count: 4, label: "Problem Solving", share: 10 },
    { count: 3, label: "Expression of Ideas", share: 8 },
  ],
  timing: [
    { label: "Reading", value: "1m 24s", seconds: 84 },
    { label: "Writing", value: "58s", seconds: 58 },
    { label: "Math", value: "1m 31s", seconds: 91 },
  ],
  heatmap: {
    exams: ["Test 01", "Test 02", "Test 03", "Test 04"],
    rows: [
      { label: "Words in Context", values: [4, 3, 2, 1] },
      { label: "Text Transitions", values: [3, 4, 2, 1] },
      { label: "Algebra", values: [2, 1, 1, 0] },
      { label: "Advanced Math", values: [4, 3, 4, 2] },
      { label: "Problem Solving", values: [3, 2, 2, 1] },
      { label: "Geometry", values: [1, 2, 1, 0] },
    ],
  },
  pattern: {
    share: 38,
    topics: "Transitions and Words in Context",
  },
} as const;

/** Deterministic sample so the dots do not move between renders. */
function buildScatter(): { correct: ScatterPoint[]; incorrect: ScatterPoint[] } {
  const correct: ScatterPoint[] = [];
  const incorrect: ScatterPoint[] = [];
  let seed = 7;

  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let i = 0; i < 150; i += 1) {
    const seconds = Math.round(6 + next() * 168);
    // Accuracy trends up with a little time, then plateaus and dips.
    const base = 38 + Math.min(seconds, 70) * 0.72 - Math.max(0, seconds - 110) * 0.2;
    const accuracy = Math.max(4, Math.min(99, Math.round(base + (next() - 0.5) * 34)));
    const point = { seconds, accuracy };
    if (accuracy >= 55 + (next() - 0.5) * 18) {
      correct.push(point);
    } else {
      incorrect.push(point);
    }
  }

  return { correct, incorrect };
}

const SCATTER = buildScatter();

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export type AnalyticsRow = {
  id: number;
  name: string;
  completedAt: string | null;
  score: number | null;
  total: number | null;
  accuracy: number | null;
};

type AnalyticsContentProps = {
  rows: AnalyticsRow[];
  bestScore: number | null;
  bestTotal: number | null;
  bestExamName: string | null;
  latestAccuracy: number | null;
};

function SectionBreakdown({
  section,
}: {
  section: (typeof DEMO.sections)[number];
}) {
  return (
    <div className="anl-section">
      <p className="anl-section-name">{section.name}</p>
      <p className="anl-section-score">
        {section.score}
        <span className="anl-section-of"> / 800</span>
      </p>
      <span className="prog-bar-track anl-section-track">
        <b
          className="prog-bar-fill"
          style={{ width: `${(section.score / 800) * 100}%` }}
        />
      </span>

      <ul className="prog-bars anl-topics">
        {section.topics.map((topic) => (
          <li key={topic.label}>
            <span className="prog-bar-label">{topic.label}</span>
            <span className="prog-bar-value">{topic.value}%</span>
            <span className="prog-bar-track">
              <b className="prog-bar-fill" style={{ width: `${topic.value}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsContent({
  rows,
  bestScore,
  bestTotal,
  bestExamName,
  latestAccuracy,
}: AnalyticsContentProps) {
  const accuracy = latestAccuracy ?? DEMO.overallAccuracy;
  const completed = rows.filter((row) => row.score != null);
  const maxMistakes = Math.max(
    ...DEMO.heatmap.rows.flatMap((row) => row.values),
    1
  );

  return (
    <div className="prog anl">
      {/* —— header —— */}
      <header className="prog-head">
        <OrbitArt />

        <div className="prog-head-copy">
          <p className="prog-eyebrow">Performance Observatory</p>
          <h1 className="prog-title">SAT Analytics</h1>
          <p className="prog-sub">Understand where your score comes from.</p>
        </div>

        <p className="prog-motto">
          Smarter practice.
          <br />
          Higher horizons.
          <span className="prog-motto-rule" aria-hidden />
          <span className="prog-motto-mark">Keplerly</span>
        </p>
      </header>

      {/* —— summary row —— */}
      <div className="prog-stats">
        <div className="prog-stat">
          <p className="prog-stat-value">{accuracy}%</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Overall Accuracy</p>
            <p className="prog-stat-delta">
              <LineChart className="h-3.5 w-3.5" aria-hidden />
              <span>+{DEMO.accuracyDelta}% since first exam</span>
            </p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">
            {bestScore != null ? `${bestScore} / ${bestTotal}` : "—"}
          </p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Best Exam Score</p>
            <p className="prog-stat-note">{bestExamName ?? "No attempts yet"}</p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">{DEMO.avgTime}</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Average Time per Question</p>
            <p className="prog-stat-delta">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              <span>{DEMO.avgTimeDelta} since first exam</span>
            </p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">+{DEMO.scoreGain}</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Score Improvement</p>
            <p className="prog-stat-note">
              from {DEMO.scoreFrom} to {DEMO.scoreTo}
            </p>
          </div>
        </div>
      </div>

      {/* —— row 1: breakdown / losses —— */}
      <div className="prog-grid">
        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <BarChart3 aria-hidden />
            </span>
            <div>
              <h3>Score Breakdown</h3>
              <p>Your performance by section and topic.</p>
            </div>
            <span className="anl-scope">All exams</span>
          </div>

          <div className="anl-split">
            {DEMO.sections.map((section) => (
              <SectionBreakdown key={section.name} section={section} />
            ))}
          </div>
        </section>

        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <Target aria-hidden />
            </span>
            <div>
              <h3>Where You Lose Points</h3>
              <p>Topics with the most missed questions.</p>
            </div>
            <span className="anl-scope">Last 3 exams</span>
          </div>

          <ol className="anl-losses">
            {DEMO.losses.map((loss) => (
              <li key={loss.label}>
                <span className="anl-loss-count">{loss.count}</span>
                <div className="anl-loss-body">
                  <div className="anl-loss-head">
                    <span className="anl-loss-label">{loss.label}</span>
                    <span className="anl-loss-share">
                      {loss.share}% of total mistakes
                    </span>
                  </div>
                  <span className="prog-bar-track">
                    <b
                      className="anl-loss-fill"
                      style={{ width: `${(loss.share / 18) * 100}%` }}
                    />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* —— row 2: scatter / timing —— */}
      <div className="prog-grid">
        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <LineChart aria-hidden />
            </span>
            <div>
              <h3>Accuracy vs. Time</h3>
              <p>
                Each dot represents a question. See the relationship between
                time spent and accuracy.
              </p>
            </div>
          </div>

          <div className="anl-scatter-wrap">
            <p className="anl-zone">
              Ideal zone
              <span>Fast + correct</span>
            </p>

            <AccuracyScatterLazy
              correct={SCATTER.correct}
              incorrect={SCATTER.incorrect}
            />

            <ul className="anl-legend">
              <li>
                <span className="anl-key anl-key--correct" aria-hidden />
                Correct
              </li>
              <li>
                <span className="anl-key anl-key--incorrect" aria-hidden />
                Incorrect
              </li>
            </ul>
          </div>
        </section>

        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <Clock aria-hidden />
            </span>
            <div>
              <h3>Time Analytics</h3>
              <p>How you spend your time across sections.</p>
            </div>
          </div>

          <ul className="prog-bars anl-timing">
            {DEMO.timing.map((entry) => (
              <li key={entry.label}>
                <span className="prog-bar-label">{entry.label}</span>
                <span className="prog-bar-value">{entry.value}</span>
                <span className="prog-bar-track">
                  <b
                    className="prog-bar-fill"
                    style={{ width: `${(entry.seconds / 91) * 100}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>

          <p className="prog-note anl-insight">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              You spend <strong>34% more time</strong> on Advanced Math
              questions than your average question.
            </span>
          </p>
        </section>
      </div>

      {/* —— row 3: comparison / heatmap —— */}
      <div className="prog-grid">
        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <Table2 aria-hidden />
            </span>
            <div>
              <h3>Exam Comparison</h3>
              <p>Compare your performance across practice exams.</p>
            </div>
          </div>

          {completed.length ? (
            <table className="prog-table anl-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((row) => (
                  <tr key={row.id}>
                    <td className="prog-td-strong">{row.name}</td>
                    <td>
                      {row.completedAt
                        ? DATE.format(new Date(row.completedAt))
                        : "—"}
                    </td>
                    <td className="prog-td-strong">
                      {row.score} / {row.total}
                    </td>
                    <td>{row.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="prog-muted">
              Complete a practice exam to compare your results here.
            </p>
          )}
        </section>

        <section className="prog-panel">
          <div className="prog-panel-head">
            <span className="prog-panel-icon">
              <Grid3x3 aria-hidden />
            </span>
            <div>
              <h3>Mistake Heatmap</h3>
              <p>Number of incorrect answers by topic and exam.</p>
            </div>
          </div>

          <div className="anl-heat" role="table" aria-label="Mistakes by topic and exam">
            <div className="anl-heat-row anl-heat-head" role="row">
              <span role="columnheader" />
              {DEMO.heatmap.exams.map((exam) => (
                <span key={exam} role="columnheader">
                  {exam}
                </span>
              ))}
            </div>

            {DEMO.heatmap.rows.map((row) => (
              <div key={row.label} className="anl-heat-row" role="row">
                <span className="anl-heat-label" role="rowheader">
                  {row.label}
                </span>
                {row.values.map((value, index) => (
                  <span
                    key={DEMO.heatmap.exams[index]}
                    className="anl-heat-cell"
                    role="cell"
                    aria-label={`${row.label}, ${DEMO.heatmap.exams[index]}: ${value} mistakes`}
                    style={{
                      // Steps, not a gradient — one hue, five levels.
                      opacity: 0.14 + (value / maxMistakes) * 0.86,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <p className="anl-heat-legend">
            <span className="anl-heat-key is-high" aria-hidden />
            More mistakes
            <span className="anl-heat-key is-low" aria-hidden />
            Fewer mistakes
          </p>
        </section>
      </div>

      {/* —— pattern —— */}
      <section className="prog-panel prog-panel--focus anl-pattern">
        <OrbitArt />

        <div className="prog-panel-head">
          <span className="prog-panel-icon">
            <Sparkles aria-hidden />
          </span>
          <div>
            <h3>Pattern Detected</h3>
            <p>
              Across your last 3 exams, <strong>{DEMO.pattern.share}%</strong> of
              your lost Reading &amp; Writing points came from{" "}
              <strong>{DEMO.pattern.topics}</strong>.
            </p>
          </div>
        </div>

        <div className="anl-pattern-foot">
          <p className="prog-muted">
            Focus on these topics to see the biggest improvement in your next
            exam.
          </p>

          <LocaleLink href="/dashboard/sat/lessons" className="prog-cta">
            Practice these topics
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LocaleLink>
        </div>
      </section>
    </div>
  );
}
