import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { siteConfig } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.fullName}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col font-sans bg-white text-[#37474f]`}
      >
        <Navbar />
        <main className="flex-1 min-h-0 w-full">{children}</main>
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
