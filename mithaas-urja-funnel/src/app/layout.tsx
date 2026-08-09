import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandName} | Premium Cash On Delivery Store`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description:
    "A premium D2C Cash On Delivery storefront for Mithaas Urja with product selection, checkout, Google Sheets order logging, and email notifications built with Next.js.",
  metadataBase: new URL(siteConfig.siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-[#fff9f4] text-slate-900">{children}</body>
    </html>
  );
}
