"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  brandName: string;
  isClerkConfigured: boolean;
}

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/plans", label: "Plans" },
  { href: "/faq", label: "FAQ" },
  { href: `mailto:${supportEmail}`, label: "Support" },
];

export function Navbar({ brandName, isClerkConfigured }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("mailto:")) return false;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <header 
      className="sticky top-0 !z-[9998] bg-white/95 dark:bg-slate-800/95 shadow-sm border-b border-gray-100 dark:border-slate-700/50 transition-all duration-200" 
      style={{ 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        zIndex: 9998
      }} 
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Left Section - Mobile Menu + Brand */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 lg:flex-initial">
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex-shrink-0">
              <MobileNav brandName={brandName} isClerkConfigured={isClerkConfigured} />
            </div>
            
            {/* Brand Logo/Name */}
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={`${brandName} - Home`}
            >
              <Image
                src="/myumrahesim-logo.svg"
                alt={brandName}
                width={120}
                height={40}
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain dark:brightness-0 dark:invert transition-opacity group-hover:opacity-80"
                priority
              />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors whitespace-nowrap truncate hidden sm:block">
                {brandName}
              </span>
            </Link>
          </div>

          {/* Center Section - Desktop Navigation */}
          <nav 
            className="hidden lg:flex items-center gap-1 xl:gap-2" 
            role="navigation" 
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm xl:text-base font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                    ${
                      active
                        ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20"
                        : "text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active && (
                    <span 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-600 dark:bg-sky-400"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section - Theme Toggle + Orders Button */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Desktop My Orders Button */}
            {isClerkConfigured && (
              <Link
                href="/orders"
                className="hidden lg:inline-flex items-center justify-center px-4 xl:px-5 py-2 xl:py-2.5 text-sm xl:text-base font-semibold text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 rounded-lg transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                My Orders
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

