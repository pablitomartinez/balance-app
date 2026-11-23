import Image from "next/image";
import { Check } from "lucide-react";

export function SharedExpensesSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <Image
            src="/marketing/collaboration-detail.webp"
            alt="Una pareja consulta el teléfono mientras organiza sus cuentas"
            width={1600}
            height={1024}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] rounded-[2rem] object-cover shadow-soft"
          />
          <div className="absolute -bottom-7 right-4 max-w-[15rem] rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Un movimiento completo
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Importe, categoría, quién pagó y estado, juntos.
            </p>
          </div>
        </div>
        <div className="lg:pl-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Gastos compartidos
          </p>
          <h2 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.04em] text-foreground md:text-6xl">
            Cada gasto, claro desde el principio.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Balance guarda el contexto de cada movimiento para que ambos puedan
            entenderlo después, sin volver a preguntar.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Quién pagó",
              "Importe y categoría",
              "Participación de cada persona",
              "Historial y estado",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 border-b border-border pb-4 font-semibold text-foreground"
              >
                <Check className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
