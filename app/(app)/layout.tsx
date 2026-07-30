import { AppHeader } from "@/components/shared/AppHeader";
import { AppNav } from "@/components/shared/AppNav";
import { AuthGuard } from "@/components/shared/AuthGuard";

// Layout privado. Todas las pantallas del hogar comparten protección, header y navegación.
export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-0">
        <AppHeader />
        <AppNav />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
