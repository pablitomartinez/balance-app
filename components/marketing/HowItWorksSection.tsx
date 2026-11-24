const steps = [
  ["01", "Creá tu hogar", "Configurá el espacio que van a compartir."],
  ["02", "Invitá a tu pareja", "Ambos tienen acceso al mismo hogar y a la misma información."],
  ["03", "Organicen juntos", "Registren gastos, servicios y movimientos sin reconstruir cuentas cada fin de mes."],
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-28 bg-brand-muted px-5 py-24 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cómo funciona</p>
        <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Un hogar compartido.<br />Tres pasos simples.</h2>
        <ol className="relative mt-16 border-l border-primary/30 md:ml-12 md:mt-24">
          {steps.map(([number, title, copy], index) => (
            <li key={number} className={`relative grid gap-4 py-10 pl-8 md:grid-cols-[10rem_1fr] md:gap-12 md:pl-16 ${index < 2 ? "border-b border-primary/15" : ""}`}>
              <span className="absolute -left-4 top-12 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">{number}</span>
              <span className="text-6xl font-black tracking-[-0.06em] text-primary/25 md:text-8xl">{number}</span>
              <div className="md:pt-3"><h3 className="text-2xl font-black text-foreground md:text-4xl">{title}</h3><p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
