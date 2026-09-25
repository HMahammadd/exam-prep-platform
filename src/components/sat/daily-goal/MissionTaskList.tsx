import { ArrowRight, Check, Clock3, Info, Target } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import type { CurrentTaskInfo, MissionTaskId, MissionTaskSummary } from "@/types/daily-mission";

const MAX_STEP_BARS = 12;

function Steps({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="op-steps" aria-hidden>
      {total <= MAX_STEP_BARS ? (
        Array.from({ length: total }, (_, i) => <i key={i} className={i < completed ? "is-on" : undefined} />)
      ) : (
        <span className="op-steps-bar">
          <span style={{ width: `${(completed / total) * 100}%` }} />
        </span>
      )}
      <span className="op-steps-count">
        {completed} of {total}
      </span>
    </div>
  );
}

function TaskRow({ task, index }: { task: MissionTaskSummary; index: number }) {
  const body = (
    <>
      <span className="op-task-num">{String(index + 1).padStart(2, "0")}</span>
      <span className="op-task-text">
        <span className="op-task-title">{task.title}</span>
        <span className="op-task-sub">{task.subtitle}</span>
      </span>
      <span className="op-chip">
        {task.status === "completed" ? <Check aria-hidden /> : null}
        {task.total === 0 ? "Clear" : `${task.completed}/${task.total}`}
      </span>
    </>
  );

  if (task.total === 0) return <div className="op-task-link">{body}</div>;
  return (
    <LocaleLink href={task.href} className="op-task-link">
      {body}
    </LocaleLink>
  );
}

function CurrentTask({
  task,
  index,
  current,
}: {
  task: MissionTaskSummary;
  index: number;
  current: CurrentTaskInfo;
}) {
  return (
    <>
      <p className="op-current-eyebrow">
        <span>
          {String(index + 1).padStart(2, "0")} · {task.title}
        </span>
        {current.minutes > 0 ? (
          <span className="op-current-time">
            <Clock3 aria-hidden />
            about {current.minutes} min
          </span>
        ) : null}
      </p>
      <p className="op-current-title">{current.title}</p>
      <Steps completed={task.completed} total={task.total} />
      {current.stat || current.insight ? (
        <div className="op-current-facts">
          {current.stat ? (
            <span>
              <Target aria-hidden />
              <b>{current.stat.value}</b> {current.stat.label}
            </span>
          ) : null}
          {current.insight ? (
            <span className="op-current-insight">
              <Info aria-hidden />
              {current.insight}
            </span>
          ) : null}
        </div>
      ) : null}
      <LocaleLink href={current.href} className="op-btn-primary">
        {current.ctaLabel}
        <ArrowRight aria-hidden />
      </LocaleLink>
    </>
  );
}

export function MissionTaskList({
  tasks,
  current,
  active,
  onActive,
}: {
  tasks: MissionTaskSummary[];
  current: CurrentTaskInfo;
  active: MissionTaskId | null;
  onActive: (id: MissionTaskId | null) => void;
}) {
  const left = tasks.filter((task) => task.status !== "completed").length;

  return (
    <section className="op-tasks" aria-label="Today's tasks">
      <h2 className="op-tasks-head">
        Tasks
        <span>{left === 0 ? "all done" : `${left} of ${tasks.length} left`}</span>
      </h2>

      <ol className="op-task-list">
        {tasks.map((task, index) => {
          const isCurrent = task.id === current.taskId;
          return (
            <li
              key={task.id}
              className={`op-task is-${task.status}${isCurrent ? " is-open" : ""}${active === task.id ? " is-active" : ""}`}
              onPointerEnter={() => onActive(task.id)}
              onPointerLeave={() => onActive(null)}
              onFocus={() => onActive(task.id)}
              onBlur={() => onActive(null)}
            >
              {isCurrent ? (
                <CurrentTask task={task} index={index} current={current} />
              ) : (
                <TaskRow task={task} index={index} />
              )}
            </li>
          );
        })}
      </ol>

      {current.taskId === null ? (
        <div className="op-finished">
          <p className="op-current-title">{current.title}</p>
          {current.stat ? (
            <p className="op-current-facts">
              <span>
                <Target aria-hidden />
                <b>{current.stat.value}</b> {current.stat.label}
              </span>
            </p>
          ) : null}
          {current.insight ? <p className="op-finished-text">{current.insight}</p> : null}
          <LocaleLink href={current.href} className="op-btn-primary">
            {current.ctaLabel}
            <ArrowRight aria-hidden />
          </LocaleLink>
        </div>
      ) : null}
    </section>
  );
}
