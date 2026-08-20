import Link from "next/link";
import {
  CheckCircle2,
  HandCoins,
  Home,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: ReceiptText,
    title: "Registrá los gastos de la casa",
    description:
      "Cargá supermercado, servicios, impuestos y otros gastos compartidos. Balance divide estos gastos 50/50.",
  },
  {
    icon: CheckCircle2,
    title: "Confirmá los gastos",
    description:
      "Cuando la otra persona registra un gasto, revisalo desde Aprobar antes de incorporarlo a las cuentas del hogar.",
  },
  {
    icon: HandCoins,
    title: "Registrá préstamos personales",
    description:
      "Si pagaste algo exclusivamente por la otra persona, registralo como préstamo personal. No se mezcla con los gastos 50/50.",
  },
  {
    icon: Home,
    title: "Revisá los saldos",
    description:
      "En Inicio podés ver por separado el balance de gastos del hogar y las deudas personales.",
  },
];

const faqs = [
  {
    question: "¿Qué cuenta como gasto del hogar?",
    answer:
      "Un gasto que corresponde a los dos, como supermercado, servicios, alquiler o compras compartidas. Se divide 50/50.",
  },
  {
    question: "¿Cuándo uso un préstamo personal?",
    answer:
      "Cuando una persona paga algo que corresponde solamente a la otra. Por ejemplo, si Agostina paga un arreglo del auto de Pablo.",
  },
  {
    question: "¿Los préstamos modifican el gasto mensual de la casa?",
    answer:
      "No. Los préstamos personales se mantienen separados del resumen y del balance de gastos compartidos.",
  },
  {
    question: "¿Qué pasa si rechazo un gasto?",
    answer:
      "El gasto queda rechazado y no entra en el balance compartido del hogar.",
  },
  {
    question: "¿Cómo sé cuánto le debo a la otra persona?",
    answer:
      "Inicio muestra el balance correspondiente a los gastos compartidos y, por separado, la deuda personal pendiente.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">
          Ayuda
        </p>

        <h1 className="mt-2 text-2xl font-black text-foreground">
          Cómo usar Balance
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Balance mantiene separados los gastos de la casa y el dinero que se
          prestan entre ustedes.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Empezá en 4 pasos
        </h2>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    PASO {index + 1}
                  </p>

                  <h3 className="mt-1 font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <div>
            <h2 className="font-bold text-foreground">
              Una regla sencilla
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Si el gasto es de los dos, registralo como gasto del hogar.
              Si una persona pagó algo exclusivamente por la otra, registralo
              como préstamo personal.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Preguntas frecuentes
        </h2>

        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group p-4"
            >
              <summary className="cursor-pointer list-none font-semibold text-foreground">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}

                  <span className="text-lg font-normal text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>

              <p className="mt-3 pr-6 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="pb-4">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}