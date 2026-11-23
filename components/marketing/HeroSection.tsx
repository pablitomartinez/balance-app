import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="overflow-hidden px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1440px] flex-col justify-center">
        <div className="marketing-enter relative z-10 max-w-4xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary md:text-xs">
            Gastos compartidos, con claridad
          </p>

          <h1 className="max-w-5xl text-[clamp(2.65rem,8.7vw,4.75rem)] font-black leading-[0.94] tracking-[-0.055em] text-foreground md:text-[clamp(3.4rem,6.7vw,5.8rem)] lg:text-[clamp(3.7rem,5.5vw,6rem)]">
            Compartir los gastos{" "}
            <span className="text-primary">sin convertirlos</span> en una
            discusión.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
            Balance organiza los gastos de tu hogar, muestra quién pagó, qué
            corresponde a cada persona y mantiene todo claro en un solo lugar.
          </p>

          <div className="mt-5 flex flex-row flex-wrap gap-3 md:mt-6">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-soft transition hover:bg-primary-hover sm:px-5 sm:text-sm"
            >
              Empezar con Balance
            </Link>

            <a
              href="#como-funciona"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card/80 px-4 text-xs font-bold text-foreground transition hover:bg-muted sm:px-5 sm:text-sm"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        <div className="marketing-enter marketing-enter-delay relative mt-6 md:mt-8 lg:ml-[18%] lg:mt-8">
          <div className="relative h-[clamp(10.5rem,23svh,13.5rem)] overflow-hidden rounded-[1.75rem] bg-muted shadow-[0_30px_80px_rgba(65,48,72,0.16)] sm:h-[clamp(12rem,25svh,15rem)] md:h-[clamp(14rem,28svh,18rem)] md:rounded-[2.5rem] lg:h-[clamp(15rem,30svh,20rem)]">
            <Image
              src="/marketing/hero-couple.webp"
              alt="Una pareja organiza los gastos de su hogar desde el teléfono"
              fill
              sizes="(max-width: 768px) 100vw, 82vw"
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#241b27]/30 via-transparent to-transparent" />
          </div>

          <div className="absolute right-3 top-3 hidden rounded-full bg-secondary px-4 py-2 text-xs font-black text-secondary-foreground shadow-soft sm:block md:right-5 md:top-5 md:text-sm">
            Todo claro, entre dos.
          </div>
        </div>
      </div>
    </section>
  );
}