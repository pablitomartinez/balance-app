import { Moon, Smartphone } from "lucide-react";

function ProductPlaceholder({ label, mobile = false, dark = false }: { label: string; mobile?: boolean; dark?: boolean }) {
  return (
    <div className={`${mobile ? "aspect-[9/18] rounded-[2rem]" : "aspect-[16/10] rounded-2xl"} flex overflow-hidden border ${dark ? "border-white/10 bg-[#272128] text-[#f1ece7]" : "border-border bg-card text-foreground"} p-3 shadow-[0_28px_70px_rgba(65,48,72,0.16)]`}>
      <div className="flex w-full flex-col items-center justify-center rounded-[calc(1rem-3px)] border border-dashed border-current/20 bg-current/[0.025] px-4 text-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
        <p className="mt-2 max-w-48 text-[9px] leading-4 opacity-45">Captura real pendiente</p>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section id="producto" className="scroll-mt-28 overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">El producto</p><h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-foreground md:text-6xl">Todo lo que pasa en tu hogar, en un solo lugar.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Un resumen compartido para entender el mes, revisar movimientos y saber qué necesita atención.</p></div>
        <div className="product-float relative mt-14 pb-28 md:pb-40">
          <div className="w-[94%] lg:w-[82%]"><ProductPlaceholder label="Dashboard · escritorio" /></div>
          <div className="absolute -bottom-2 right-[2%] w-[30%] min-w-[9rem] max-w-[19rem] rotate-2"><ProductPlaceholder label="Dashboard" mobile /></div>
          <div className="absolute -bottom-20 right-[28%] hidden w-[26%] max-w-[17rem] -rotate-3 md:block"><ProductPlaceholder label="Modo oscuro" mobile dark /></div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-7 text-sm font-semibold text-muted-foreground"><span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> Diseñado para usar todos los días</span><span className="flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> Claro u oscuro, como prefieran</span></div>
      </div>
    </section>
  );
}
