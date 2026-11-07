export function PlaceholderPage({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <section>
      <p className="mb-3 text-sm font-medium text-primary">Planned · {phase}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-white p-8">
        <h2 className="font-medium">No connected data yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is a placeholder. Its features will be added in a later
          development phase.
        </p>
      </div>
    </section>
  );
}
