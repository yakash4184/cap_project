import clsx from "clsx";

export function SectionCard({ className, children }) {
  return (
    <section
      className={clsx(
        "surface-panel gradient-border relative overflow-hidden rounded-2xl p-5 sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
