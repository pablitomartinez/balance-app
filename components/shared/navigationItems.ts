import {
  CheckCheck,
  HandCoins,
  House,
  ReceiptText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Inicio", icon: House },
  { href: "/expenses", label: "Gastos", icon: ReceiptText },
  { href: "/approvals", label: "Aprobar", icon: CheckCheck },
  { href: "/personal-loans", label: "Préstamos", icon: HandCoins },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
