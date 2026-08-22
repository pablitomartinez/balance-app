import Link from "next/link";
import { Home, KeyRound } from "lucide-react";

const options = [
  {
    href: "/create-home",
    title: "Crear hogar",
    description:
      "Empezá un hogar nuevo y después invitá a la otra persona.",
    icon: Home,
  },
  {
    href: "/join-home",
    title: "Unirme con código",
    description: "Usá el código que te compartió la otra persona.",
    icon: KeyRound,
  },
];

export default function HomeEntryPage() {
  return (
    <section className="mx-auto w-full max-w-md py-6 md:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary">Balance Hogar</p>

        <h1 className="mt-3 text-3xl font-black leading-tight text-foreground sm:text-4xl">
          Empezá a usar Balance
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Creá un hogar nuevo o unite al de la otra persona con un código de
          invitación.
        </p>
      </div>

      <div className="space-y-3">
        {options.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-soft transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>

            <span className="min-w-0">
              <span className="block font-bold text-foreground">{title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
