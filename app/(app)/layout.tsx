import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/shared/AuthGuard";

// Layout privado. Todas las pantallas del hogar comparten protección y app shell.
export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
