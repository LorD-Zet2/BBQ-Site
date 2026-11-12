import type { Metadata, Viewport } from "next";
import { Manrope, Roboto_Slab } from "next/font/google";
import { shop } from "@/config/shop";
import "./globals.css";

const fontDisplay = Roboto_Slab({
  subsets: ["cyrillic", "latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="ru" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body>
        <a className="skip-link" href="#main">К основному содержимому</a>
        {children}
      </body>
    </html>
  );
}
