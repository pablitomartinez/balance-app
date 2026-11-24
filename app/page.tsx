import type { Metadata } from "next";
import { PublicLanding } from "@/components/marketing/PublicLanding";

export const metadata: Metadata = {
  title: "Balance — Gastos compartidos con claridad",
  description: "Organizá los gastos de tu hogar, sepan quién pagó y mantengan sus cuentas compartidas claras en un solo lugar.",
};

export default function HomePage() {
  return <PublicLanding />;
}
