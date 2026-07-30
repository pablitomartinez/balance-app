import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Balance Hogar",
  description: "Balance compartido para gastos del hogar"
};

// Este layout raíz define la estructura HTML común de toda la aplicación.
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
