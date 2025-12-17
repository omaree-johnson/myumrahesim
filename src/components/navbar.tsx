"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { ShoppingCart } from "lucide-react";
import { useSiteConfig } from "./site-config-provider";
import { useCart } from "./cart-provider";

interface NavbarProps {
  brandName: string;
  isClerkConfigured: boolean;
}

export function Navbar({ brandName, isClerkConfigured }: NavbarProps) {
  const { supportEmail } = useSiteConfig();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by only checking active state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/plans", label: "Plans" },
    { href: "/faq", label: "FAQ" },
    { href: "/support", label: "Support" },
  ];

  const isActive = (href: string) => {
    if (!mounted) return false; // Return false during SSR to prevent hydration mismatch
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
                src="/ChatGPT_Image_Dec_10__2025__01_30_08_PM-removebg-preview.png"
                alt={brandName}
                width={120}
                height={40}
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain transition-opacity group-hover:opacity-80"
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

            {/* Cart */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="View cart"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            
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

