import { Flame, Home, Lightbulb, Tv, Wifi } from "lucide-react";

const services = [
  [Lightbulb, "Electricidad"],
  [Wifi, "Internet"],
  [Flame, "Gas"],
  [Tv, "Streaming"],
  [Home, "Alquiler"],
] as const;

export function HomeServicesSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] bg-accent text-accent-foreground lg:grid-cols-[1.05fr_.95fr] lg:rounded-[3rem]">
        <div className="p-8 md:p-14 lg:p-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
            Servicios del hogar
          </p>
          <h2 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.04em] md:text-6xl">
            Las cuentas de la casa también tienen su lugar.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 opacity-75">
            Al registrar un gasto, pueden asociarlo a un servicio del hogar. Así
            la luz, internet o el alquiler conservan su contexto dentro del
            balance compartido.
          </p>
          <p className="mt-5 max-w-lg text-sm leading-6 opacity-60">
            Balance registra y organiza estas cuentas; no realiza pagos ni envía
            recordatorios automáticos.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-accent-foreground/10 p-px sm:grid-cols-3 lg:grid-cols-2">
          {services.map(([Icon, label], index) => (
            <div
              key={label}
              className={`flex min-h-36 flex-col justify-between bg-accent p-6 md:min-h-44 ${index === 4 ? "col-span-2 sm:col-span-1 lg:col-span-2" : ""}`}
            >
              <Icon className="h-6 w-6 opacity-65" />
              <span className="font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
