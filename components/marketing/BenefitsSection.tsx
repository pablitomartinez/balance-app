const benefits = [["Claridad", "Todos saben qué se pagó y qué queda pendiente."], ["Organización", "Los gastos compartidos viven en un solo lugar."], ["Menos fricción", "No hay que reconstruir cuentas desde mensajes y transferencias."], ["Control compartido", "Los dos pueden entender qué está pasando con los gastos del hogar."]];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="scroll-mt-28 px-5 py-24 md:px-8 md:py-32 lg:px-12"><div className="mx-auto max-w-[1440px]">
      <div className="grid gap-8 border-b border-border pb-12 lg:grid-cols-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Lo que cambia</p><h2 className="text-4xl font-black leading-[1.03] tracking-[-0.04em] text-foreground md:text-6xl">Más espacio para hablar de planes. Menos para reconstruir cuentas.</h2></div>
      <div className="divide-y divide-border">{benefits.map(([title, copy], index) => <article key={title} className="grid gap-4 py-9 md:grid-cols-[6rem_0.7fr_1fr] md:items-baseline md:py-12"><span className="text-xs font-black text-primary">0{index+1}</span><h3 className="text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">{title}</h3><p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{copy}</p></article>)}</div>
    </div></section>
  );
}
