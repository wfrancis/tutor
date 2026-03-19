import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavWrapper } from "@/components/NavWrapper";

export const metadata: Metadata = {
  title: "Arctic Quest — Cole's Training Ground",
  description:
    "AI-powered English practice for standardized test prep — conquer vocab, reading, and writing like an Arctic explorer.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arctic Quest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1628",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0b1628] text-[#e2e8f0] font-[Inter,system-ui,sans-serif]">
        <NavWrapper>{children}</NavWrapper>
      </body>
    </html>
  );
}
