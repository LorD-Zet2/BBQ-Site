import type { Metadata, Viewport } from "next";
import { shop } from "@/config/shop";
import "./globals.css";

export const metadata: Metadata = {
  title: `${shop.brandName} — Настоящее BBQ в Махачкале`,
  description: "Говяжьи рёбра кальби медленного копчения 7–8 часов в Махачкале. 100% Халяль.",
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

      <body>
        <a className="skip-link" href="#main">К основному содержимому</a>
        {children}
      </body>
    </html>
  );
}
