import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for modern clean look
import "./globals.css";
import Sidebar from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header";

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
      <body className={`${inter.className} flex h-screen bg-background overflow-hidden`}>
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 pt-2 scroll-smooth">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
