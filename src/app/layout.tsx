import type { Metadata, Viewport } from "next";
import { shop } from "@/config/shop";
import "./globals.css";

export const metadata: Metadata = {
  title: `${shop.brandName} — Говяжьи рёбра кальби из смокера в Махачкале`,
  description: "Настоящее техасское BBQ 100% Халяль в Махачкале. Говяжьи рёбра кальби 6–8 часов томления на пеллетах, фирменные соусы и гарниры с доставкой.",
  robots: { index: shop.orderingOpen, follow: shop.orderingOpen },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F4EE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Roboto+Slab:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ ["--font-display" as string]: "'Roboto Slab', Georgia, serif", ["--font-sans" as string]: "'Manrope', sans-serif" }}>
        <a className="skip-link" href="#main">К основному содержимому</a>
        {children}
      </body>
    </html>
  );
}
