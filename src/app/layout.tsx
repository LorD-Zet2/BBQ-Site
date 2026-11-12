import type { Metadata, Viewport } from "next";
import { shop } from "@/config/shop";
import "./globals.css";

export const metadata: Metadata = {
  title: "Говяжьи рёбра кальби | BBQ в Махачкале",
  description: "Предзаказ говяжьих рёбер кальби из пеллетного смокера в Махачкале.",
  robots: { index: shop.orderingOpen, follow: shop.orderingOpen },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#101010" };

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
