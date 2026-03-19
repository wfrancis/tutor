import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cole's English Practice Hub",
  description: "AI-powered English practice for standardized test prep — based on lessons with tutor Ann Kenny",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-[var(--card-border)] bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-[var(--primary)]">
              English Practice Hub
            </a>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/vocabulary" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Vocabulary</a>
              <a href="/reading" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Reading</a>
              <a href="/practice" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">AI Practice</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
