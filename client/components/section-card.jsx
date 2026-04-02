import clsx from "clsx";

export function SectionCard({ className, children }) {
  return (
    <section
      className={clsx(
        "surface-panel gradient-border relative overflow-hidden rounded-[28px] p-6 sm:p-7",
        className
      )}
    >
      {children}
    </section>
  );
}

