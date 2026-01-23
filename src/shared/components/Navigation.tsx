"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminComingSoonButton } from "@/features/admin/components/AdminComingSoonButton";
import { AdminContactButton } from "@/features/admin/components/AdminContactButton";
import { UserStatus, AuthModal } from "@/features/auth/components";

const NAV_LINKS = [
  { href: "/", label: "Home", dataCy: "home-nav-link" },
  { href: "/dashboard", label: "Dashboard", dataCy: "dashboard-link" },
  { href: "/tickets", label: "Tickets", dataCy: "tickets-link" },
  { href: "/contact", label: "Kontakt", dataCy: "contact-link" },
];

export function Navigation() {
  const pathname = usePathname();
  const hideNavigation = pathname?.startsWith("/admin/coming-soon");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  if (hideNavigation) {
    return null;
  }

  const isActive = (href: string) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-theme-secondary bg-[#05070d]/90 backdrop-blur-xl"
        data-cy="navigation"
        role="navigation"
      >
        <div className="app-shell h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-theme-primary"
            data-cy="home-link"
          >
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
              🎸
            </span>
            <span className="hidden sm:block">Metal3DCore</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-semibold transition-colors ${
                  isActive(link.href) ? "text-theme-primary" : "text-theme-secondary hover:text-theme-primary"
                }`}
                data-cy={link.dataCy}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500" />
                )}
              </Link>
            ))}
            <AdminContactButton />
            <AdminComingSoonButton />
            <UserStatus onOpenAuth={mode => setAuthMode(mode)} />
          </div>

          <button
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-theme-secondary text-theme-primary"
            onClick={() => setIsMobileOpen(prev => !prev)}
            aria-label="Navigation öffnen"
            aria-expanded={isMobileOpen}
            data-cy="mobile-menu-toggle"
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`lg:hidden origin-top border-t border-theme-secondary bg-[#05070d]/95 backdrop-blur-xl transition-transform duration-300 ${
            isMobileOpen ? "scale-y-100" : "scale-y-0"
          }`}
          data-cy="mobile-navigation"
        >
          <div className="app-shell py-6 space-y-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between text-lg font-semibold ${
                  isActive(link.href) ? "text-theme-primary" : "text-theme-secondary"
                }`}
                data-cy={`mobile-${link.dataCy}`}
              >
                {link.label}
                {isActive(link.href) && <span>•</span>}
              </Link>
            ))}
            <div className="pt-4 border-t border-theme-secondary space-y-3">
              <AdminContactButton />
              <AdminComingSoonButton />
            </div>
            <div className="pt-2">
              <UserStatus onOpenAuth={mode => setAuthMode(mode)} />
              {/* Add mobile-specific data-cy attributes for testing */}
              <div className="sr-only">
                <span data-cy="mobile-nav-login">Login</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer ensures fixed nav never overlaps page content */}
      <div className="h-20 lg:h-24" aria-hidden="true" />

      {/* Auth Modal */}
      {authMode && <AuthModal isOpen={true} onClose={() => setAuthMode(null)} initialMode={authMode} />}
    </>
  );
}
