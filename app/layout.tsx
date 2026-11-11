import type { Metadata, Viewport } from "next";
import { Amatic_SC, Merriweather } from "next/font/google";
import "./globals.css";

const hand = Amatic_SC({ subsets: ["latin"], weight: ["700"], variable: "--font-hand" });
const serif = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });

// URL pública para las imágenes al compartir. En Vercel se toma sola del dominio de producción;
// si usas un dominio propio, ponlo en SITE_URL.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Pide Anís · Encargo de licores Altamirano";
const description =
  "Encarga anís seco, dulce, crema de anisete, Rosoli y Ruteviejo de Destilerías Altamirano (Rute). " +
  "Haz o cambia tu pedido hasta el jueves 3 de diciembre a las 15:00.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Pide Anís",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Pide Anís",
    title,
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#ee8a1d" };

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
