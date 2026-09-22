import {
  ArrowRight,
  BarChart3,
  FileText,
  Languages,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { OrbitArt } from "@/components/sat/progress/OrbitArt";
import { ScoreTrajectory } from "@/components/sat/progress/ScoreTrajectory";

/**
 * DEMO — no table backs these yet. They are kept together so it is obvious
 * what still needs a backend, and so the page reads correctly before a
 * student has attempts. Everything else on this page is real attempt data.
 */
const DEMO = {
  trajectory: [
    { label: "Jan 5", value: 1180 },
    { label: "Jan 19", value: 1240 },
    { label: "Feb 16", value: 1310 },
    { label: "Mar 16", value: 1360 },
  ],
  practiceTime: "12h 20m",
  readiness: 72,
  breakdown: [
    { label: "Reading & Writing", value: 78 },
    { label: "Math", value: 67 },
    { label: "Consistency", value: 74 },
  ],
  focus: {
    topic: "Advanced Algebra",
    body: "You lost 7 points here across your last 3 exams. Targeted practice can significantly boost your score.",
  },
} as const;

export type ProgressRow = {
  id: number;
  name: string;
  completedAt: string | null;
  score: number | null;
  total: number | null;
  accuracy: number | null;
  available: boolean;
  attemptId: string | null;
};

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** Circular meter — one arc, no gradient, no glow. */
function ReadinessMeter({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div className="prog-meter">
      <svg viewBox="0 0 128 128" aria-hidden>
        <circle cx="64" cy="64" r={r} className="prog-meter-track" />
        <circle
          cx="64"
          cy="64"
          r={r}
          className="prog-meter-value"
          strokeDasharray={`${(c * value) / 100} ${c}`}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <span className="prog-meter-text">
        <strong>
          {value}
          <span className="prog-meter-unit">%</span>
        </strong>
        <span className="prog-meter-label">Overall Readiness</span>
      </span>
    </div>
  );
}

export function ProgressContent({
  rows,
  completedCount,
  availableCount,
  latestAccuracy,
}: {
  rows: ProgressRow[];
  completedCount: number;
  availableCount: number;
  latestAccuracy: number | null;
}) {
  const first = DEMO.trajectory[0].value;
  const last = DEMO.trajectory[DEMO.trajectory.length - 1].value;
  const gain = last - first;

  return (
    <div className="prog">
      <header className="prog-head">
        <OrbitArt />

        <div className="prog-head-copy">
          <p className="prog-eyebrow">Your journey</p>
          <h2 className="prog-title">Your SAT Progress</h2>
          <p className="prog-sub">Consistent practice. Real improvement.</p>
        </div>

        <p className="prog-motto">
          Small steps<br />to big<br />destinations.
          <span className="prog-motto-rule" aria-hidden />
          <span className="prog-motto-mark">Keplerly</span>
        </p>
      </header>

      {/* One row, thin dividers — not four cards. */}
      <section className="prog-stats" aria-label="Summary">
        <div className="prog-stat">
          <p className="prog-stat-value">{last}</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Best Score</p>
            <p className="prog-stat-delta">
              <TrendingUp aria-hidden />+{gain}
              <span>Since first exam</span>
            </p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">
            {latestAccuracy != null ? `${latestAccuracy}%` : "—"}
          </p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Latest Accuracy</p>
            <p className="prog-stat-delta">
              <TrendingUp aria-hidden />
              +14%
            </p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">{completedCount}</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Exams Completed</p>
            <p className="prog-stat-note">out of {availableCount}</p>
          </div>
        </div>

        <div className="prog-stat">
          <p className="prog-stat-value">{DEMO.practiceTime}</p>
          <div className="prog-stat-meta">
            <p className="prog-stat-label">Total Practice Time</p>
          </div>
        </div>
      </section>

      <div className="prog-grid">
        <section className="prog-panel prog-panel--chart">
          <header className="prog-panel-head">
            <span className="prog-panel-icon" aria-hidden>
              <BarChart3 />
            </span>
            <div>
              <h3>Score Trajectory</h3>
              <p>Your practice exam scores over time.</p>
            </div>
          </header>

          <div className="prog-chart-row">
            <ScoreTrajectory points={[...DEMO.trajectory]} />

            <aside className="prog-gain">
              <TrendingUp className="prog-gain-icon" aria-hidden />
              <p className="prog-gain-value">+{gain}</p>
              <p className="prog-gain-label">points</p>
              <p className="prog-gain-note">
                from {first} to {last}
              </p>
            </aside>
          </div>
        </section>

        <section className="prog-panel prog-panel--readiness">
          <header className="prog-panel-head">
            <span className="prog-panel-icon" aria-hidden>
              <Target />
            </span>
            <div>
              <h3>Exam Readiness</h3>
            </div>
            <span className="prog-panel-link">
              View details <ArrowRight aria-hidden />
            </span>
          </header>

          <div className="prog-readiness-row">
            <ReadinessMeter value={DEMO.readiness} />

            <ul className="prog-bars">
              {DEMO.breakdown.map((item) => (
                <li key={item.label}>
                  <span className="prog-bar-label">{item.label}</span>
                  <span className="prog-bar-value">{item.value}%</span>
                  <span className="prog-bar-track" aria-hidden>
                    <span
                      className="prog-bar-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="prog-note">
            <ShieldCheck aria-hidden />
            <span>
              <strong>You&apos;re on the right track!</strong>
              Keep practicing to reach your target score.
            </span>
          </p>
        </section>

        <section className="prog-panel prog-panel--exams">
          <header className="prog-panel-head">
            <span className="prog-panel-icon" aria-hidden>
              <FileText />
            </span>
            <div>
              <h3>Recent Practice Exams</h3>
              <p>Your latest full-length practice tests.</p>
            </div>
            <LocaleLink href="/dashboard/sat" className="prog-panel-link">
              View all exams <ArrowRight aria-hidden />
            </LocaleLink>
          </header>

          <table className="prog-table">
            <thead>
              <tr>
                <th scope="col">Exam</th>
                <th scope="col">Date</th>
                <th scope="col">Score</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const done = row.score != null;
                return (
                  <tr key={row.id}>
                    <th scope="row">
                      <span
                        className={`prog-dot${done ? " is-done" : ""}`}
                        aria-hidden
                      />
                      {row.name}
                    </th>
                    <td>
                      {row.completedAt
                        ? DATE.format(new Date(row.completedAt))
                        : "—"}
                    </td>
                    <td className="prog-td-strong">
                      {done ? `${row.score} / ${row.total}` : "—"}
                    </td>
                    <td>{row.accuracy != null ? `${row.accuracy}%` : "—"}</td>
                    <td>
                      <span
                        className={`prog-status${done ? " is-done" : ""}`}
                      >
                        {done
                          ? "Completed"
                          : row.available
                            ? "Not started"
                            : "Coming soon"}
                      </span>
                    </td>
                    <td>
                      {done && row.attemptId ? (
                        <LocaleLink
                          href={`/dashboard/sat/exam/${row.id}/results`}
                          className="prog-review"
                        >
                          Review <ArrowRight aria-hidden />
                        </LocaleLink>
                      ) : (
                        <span className="prog-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="prog-panel prog-panel--focus">
          <OrbitArt />

          <header className="prog-panel-head">
            <span className="prog-panel-icon" aria-hidden>
              <Languages />
            </span>
            <div>
              <h3>Your Next Focus</h3>
            </div>
          </header>

          <div className="prog-focus-body">
            <p className="prog-focus-topic">{DEMO.focus.topic}</p>
            <p className="prog-focus-text">{DEMO.focus.body}</p>

            <LocaleLink href="/dashboard/sat/lessons" className="prog-cta">
              Practice this topic <ArrowRight aria-hidden />
            </LocaleLink>
          </div>

          <p className="prog-focus-mark" aria-hidden>
            Discipline today,<br />freedom tomorrow.
            <span className="prog-motto-rule" />
          </p>
        </section>
      </div>

      <p className="prog-quote">
        &ldquo;A higher score is a wider horizon.&rdquo;
        <span className="prog-motto-rule" aria-hidden />
        <span className="prog-motto-mark">Keplerly</span>
      </p>
    </div>
  );
}
