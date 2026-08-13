// Este archivo reúne utilidades pequeñas y reutilizables para presentación.

export function formatCurrency(value: number): string {
  // Se usa ARS por el contexto local de la app; puede ajustarse luego desde settings.
  const minimumFractionDigits = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  // Permite componer clases de Tailwind sin agregar una dependencia externa.
  return classes.filter(Boolean).join(" ");
}
