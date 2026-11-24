import { KeyRound, LockKeyhole, UsersRound } from "lucide-react";

const security = [
  [KeyRound, "Acceso personal", "Cada persona entra con su propia cuenta."],
  [
    UsersRound,
    "Un hogar compartido",
    "Solo quienes forman parte del hogar acceden a su información.",
  ],
  [
    LockKeyhole,
    "Datos separados",
    "La información de cada hogar se mantiene aislada de los demás.",
  ],
] as const;

export function SecuritySection() {
  return (
    <section
      id="seguridad"
      className="scroll-mt-28 px-5 py-24 md:px-8 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Privacidad y acceso
            </p>
            <h2 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.04em] text-foreground md:text-6xl">
              Tu hogar es solamente de ustedes.
            </h2>
          </div>
          <p className="max-w-xl self-end text-lg leading-8 text-muted-foreground">
            Balance usa acceso autenticado y permisos vinculados a cada hogar
            para que su información permanezca dentro de su espacio compartido.
          </p>
        </div>
        <div className="mt-14 grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
          {security.map(([Icon, title, copy]) => (
            <article
              key={title}
              className="border-b border-border py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0"
            >
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-8 text-xl font-black text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
