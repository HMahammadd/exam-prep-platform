export function Important({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border-2 border-red-500 px-4 py-3">
      {children}
    </p>
  );
}

export function Explanation({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-5 border-l-4 border-card-border bg-background/70 px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
        Explanation
      </p>
      <div className="mt-3 space-y-3">{children}</div>
    </aside>
  );
}

export function ExampleQuestion({
  notes,
  prompt,
  choices,
}: {
  notes?: string[];
  prompt: React.ReactNode;
  choices: readonly string[];
}) {
  return (
    <figure className="my-5 overflow-hidden rounded-xl border-2 border-foreground/80">
      <figcaption className="border-b border-card-border px-5 py-2 text-xs font-bold uppercase tracking-wider">
        Example question
      </figcaption>
      <div className="px-5 py-4">
        {notes ? (
          <div className="mb-4 border-b border-card-border pb-4">
            <p className="text-sm font-medium">
              While researching a topic, a student has taken the following
              notes.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-base font-medium leading-7">{prompt}</p>
        <ol className="mt-4 space-y-2">
          {choices.map((choice, index) => (
            <li
              key={choice}
              className="flex items-start gap-3 rounded-lg border border-card-border bg-card px-3 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foreground text-sm font-bold">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="pt-0.5 text-sm leading-6">{choice}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
