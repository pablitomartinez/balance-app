import type { Metadata } from "next";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HomeServicesSection } from "@/components/marketing/HomeServicesSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { LifestyleSection } from "@/components/marketing/LifestyleSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { SharedExpensesSection } from "@/components/marketing/SharedExpensesSection";

export const metadata: Metadata = {
  title: "Balance — Gastos compartidos con claridad",
  description: "Organizá los gastos de tu hogar, sepan quién pagó y mantengan sus cuentas compartidas claras en un solo lugar.",
};

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <ProductShowcase />
        <HowItWorksSection />
        <SharedExpensesSection />
        <HomeServicesSection />
        <BenefitsSection />
        <LifestyleSection />
        <SecuritySection />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </>
  );
}
