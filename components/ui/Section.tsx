import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

// Sección visual simple para agrupar información financiera sin sumar ruido.
export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-finance-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
