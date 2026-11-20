import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sabr By Simran — Atelier & Maison Admin Suite",
  description:
    "Exclusive luxury editorial administration portal for Sabr By Simran Haute Couture & Modest Fashion Maison, Dubai.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} dark`}
    >
      <body className="min-h-screen bg-[#1A0A0C] text-[#FAF5EF] font-sans antialiased selection:bg-[#E87272]/30 selection:text-[#FAF5EF] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
