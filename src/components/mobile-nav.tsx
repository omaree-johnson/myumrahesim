"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Package, FileText, HelpCircle, Home } from "lucide-react";
import Link from "next/link";

interface MobileNavProps {
  brandName: string;
  isClerkConfigured: boolean;
}

export function MobileNav({ brandName, isClerkConfigured }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollPositionRef = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle mount state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock scroll when menu is open - improved for cross-browser compatibility
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      // Lock scroll with better cross-browser support
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // iOS-specific fixes
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = "100%";
      }
      
      return () => {
        // Restore scroll
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        
        // iOS-specific restore
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          window.scrollTo(0, scrollPositionRef.current);
        }
      };
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((v) => !v);
  const closeMenu = () => setIsOpen(false);

  // Don't render the drawer on server to avoid hydration issues
  if (!isMounted) {
    return (
      <button
        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay (click to close) - with better cross-browser support */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black lg:hidden"
          style={{ 
            zIndex: 9998,
            opacity: 0.7,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
          onClick={closeMenu}
          onTouchStart={closeMenu}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}

      {/* Drawer - Optimized for cross-browser compatibility */}
      <nav
        ref={navRef}
        className={`fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          zIndex: 9999,
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col min-h-full">
          {/* Header with safe area padding for notched devices */}
          <div 
            className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700 shrink-0"
            style={{ 
              paddingTop: 'max(1rem, env(safe-area-inset-top))',
              background: 'linear-gradient(to right, rgb(240 249 255), rgb(239 246 255))'
            }}
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="text-xl font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              {brandName}
            </Link>

            <button
              onClick={closeMenu}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-white/50 dark:hover:bg-slate-600/50 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="space-y-1 px-3">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all font-medium"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Home</span>
              </Link>

              <Link
                href="/plans"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all font-medium"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Package className="w-5 h-5 shrink-0" />
                <span>Plans</span>
              </Link>

              <Link
                href="/blog"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all font-medium"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span>Blog</span>
              </Link>

              <Link
                href="/faq"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all font-medium"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>FAQ</span>
              </Link>

              <a
                href="#support"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all font-medium"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>Support</span>
              </a>

              {/* Divider */}
              {isClerkConfigured && (
                <div className="h-px bg-gray-200 dark:bg-slate-700 my-3 mx-2" />
              )}

              {isClerkConfigured && (
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3.5 mx-1 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                  style={{ 
                    background: 'linear-gradient(to right, rgb(2 132 199), rgb(37 99 235))',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <Package className="w-5 h-5 shrink-0" />
                  <span>My Orders</span>
                </Link>
              )}
            </div>
          </div>

          {/* Footer with safe area padding */}
          <div 
            className="px-4 py-4 border-t border-gray-200 dark:border-slate-700 shrink-0 bg-gray-50 dark:bg-slate-800"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              Instant eSIM activation for Saudi Arabia
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
