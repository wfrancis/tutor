"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { GameStateProvider, BalanceDisplay, StreakBadge } from "@/components/GameElements";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/vocabulary", label: "Vocab", icon: "📚" },
  { href: "/reading", label: "Reading", icon: "📖" },
  { href: "/practice", label: "Practice", icon: "🤖" },
];

function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="desktop-nav">
      <div className="desktop-nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-icon">🏔️</span>
          <span className="nav-logo-text">Arctic Quest</span>
        </Link>

        <div className="desktop-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`desktop-nav-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="desktop-nav-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="desktop-nav-stats">
          <StreakBadge />
          <BalanceDisplay />
        </div>
      </div>
    </nav>
  );
}

function MobileTopBar() {
  return (
    <div className="mobile-top-bar">
      <Link href="/" className="nav-logo">
        <span className="nav-logo-icon">🏔️</span>
        <span className="nav-logo-text">Arctic Quest</span>
      </Link>
      <div className="mobile-top-stats">
        <StreakBadge />
        <BalanceDisplay />
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`mobile-nav-tab ${pathname === item.href ? "active" : ""}`}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function NavWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GameStateProvider>
      {/* Desktop top nav */}
      <DesktopNav />

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Main content */}
      <main className="main-content animate-in">{children}</main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </GameStateProvider>
  );
}
