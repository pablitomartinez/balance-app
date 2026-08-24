"use client";

import { useRouter } from "next/navigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { AppHeader } from "@/components/shared/AppHeader";
import { AppNav } from "@/components/shared/AppNav";
import { HelpWidget } from "@/components/shared/HelpWidget";
import { Onboarding } from "@/components/shared/Onboarding";
import { useAuth } from "@/hooks/useAuth";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen pb-20 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:pb-0">
      <DesktopSidebar onSignOut={handleSignOut} />

      <div className="min-w-0">
        <AppHeader onSignOut={handleSignOut} />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8 lg:max-w-[1440px] lg:px-8 xl:px-10">
          {children}
        </main>
      </div>

      <AppNav />
      <HelpWidget />
      <Onboarding />
    </div>
  );
}
