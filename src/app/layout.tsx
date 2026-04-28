import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for modern clean look
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Odontodrive",
  description: "Sistema de Gestión Odontológica Avanzada con IA",
  verification: {
    // Reemplaza "TU_CODIGO_DE_SEARCH_CONSOLE" con el código HTML tag que te da Google Search Console
    google: "TU_CODIGO_DE_SEARCH_CONSOLE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google tag (gtag.js) - Incluye Google Ads y Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18125926208"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Google Ads
            gtag('config', 'AW-18125926208');
            // Google Analytics
            gtag('config', 'G-BZTLSTLM3S');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-background text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
