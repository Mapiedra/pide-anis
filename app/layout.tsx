import type { Metadata } from "next";
import { Amatic_SC, Merriweather } from "next/font/google";
import "./globals.css";

const hand = Amatic_SC({ subsets: ["latin"], weight: ["700"], variable: "--font-hand" });
const serif = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Pide Anís · Encargo de licores",
  description: "Encargo conjunto de licores Altamirano para los compañeros",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${hand.variable} ${serif.variable}`}>
      <body>
        <header className="top">
          <a href="/" className="brand" aria-label="Pide Anís, inicio">
            <span className="brand-ribbon">
              <strong>Pide Anís</strong>
              <small>Licores Altamirano · Rute</small>
            </span>
          </a>
          <a className="link" href="/catalogo.pdf" target="_blank" rel="noopener">
            Ver catálogo (PDF)
          </a>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
