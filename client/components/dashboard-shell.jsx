export function DashboardShell({ eyebrow, title, description, children, actions }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lagoon">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

