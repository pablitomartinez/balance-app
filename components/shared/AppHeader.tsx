import Image from "next/image";
import { SignOutButton } from "@/components/shared/SignOutButton";

type AppHeaderProps = {
  onSignOut: () => Promise<void>;
};

// Encabezado principal para mobile y tablet.
export function AppHeader({ onSignOut }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={38}
            height={38}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Balance Hogar
            </p>
            <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
              Tu balance compartido
            </h1>
          </div>
        </div>
        <SignOutButton onSignOut={onSignOut} className="px-3" />
      </div>
    </header>
  );
}
