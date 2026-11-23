import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="px-5 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1440px] rounded-[2rem] bg-primary px-7 py-16 text-center text-primary-foreground md:rounded-[3rem] md:px-14 md:py-24">
        <h2 className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">
          Menos cuentas pendientes.
          <br />
          Más claridad entre ustedes.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 opacity-80 md:text-lg">
          Creá su hogar en Balance y empiecen a organizar los gastos compartidos
          en un solo lugar.
        </p>
        <Link
          href="/login"
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-foreground px-7 text-sm font-black text-primary shadow-soft transition hover:opacity-90"
        >
          Empezar con Balance
        </Link>
      </div>
    </section>
  );
}
