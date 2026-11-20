import Image from "next/image";
import Link from "next/link";

const links = [
  ["Cómo funciona", "#como-funciona"],
  ["Beneficios", "#beneficios"],
  ["Seguridad", "#seguridad"],
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 md:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Balance, inicio"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/logo.png"
            alt=""
            width={42}
            height={42}
            className="h-9 w-9 object-contain md:h-10 md:w-10"
            priority
          />

          <span className="text-base font-black tracking-tight text-foreground md:text-lg">
            Balance
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-5 md:flex lg:gap-7"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-xs font-semibold text-muted-foreground transition hover:text-foreground lg:text-sm"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-10 items-center px-2 text-sm font-semibold text-foreground lg:inline-flex"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover sm:text-sm"
          >
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}