import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for modern clean look
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Odontodrive",
  description: "Sistema de Gestión Odontológica Avanzada con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
