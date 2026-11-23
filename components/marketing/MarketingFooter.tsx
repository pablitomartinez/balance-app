import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border px-5 py-12 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="font-black text-foreground">Balance</span>
        </Link>
        <nav
          aria-label="Pie de página"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-muted-foreground"
        >
          <a href="#producto">Producto</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#seguridad">Seguridad</a>
          <Link href="/login">Iniciar sesión</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Balance
        </p>
      </div>
    </footer>
  );
}
