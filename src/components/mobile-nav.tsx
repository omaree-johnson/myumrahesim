"use client";

import { useState, useEffect } from "react";
import { Menu, X, Package, FileText, HelpCircle, Home } from "lucide-react";
import Link from "next/link";

interface MobileNavProps {
  brandName: string;
  isClerkConfigured: boolean;
}

export function MobileNav({ brandName, isClerkConfigured }: MobileNavProps) {
  // Always start with menu closed
  const [isOpen, setIsOpen] = useState(false);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock scroll on both html and body
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      
      // Prevent iOS bounce
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      return () => {
        // Restore scroll
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((v) => !v);
  const closeMenu = () => setIsOpen(false);

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

      {/* Overlay (click to close) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          style={{ zIndex: 9999 }}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Drawer - Optimized for mobile */}
      <nav
        className={`fixed inset-y-0 right-0 w-[280px] sm:w-[320px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          zIndex: 10000, 
          height: '100vh',
          minHeight: '-webkit-fill-available'
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header with safe area padding for notched devices */}
          <div 
            className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700 shrink-0 bg-linear-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-700"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
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
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-white/50 dark:hover:bg-slate-600/50 transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-4">
            <nav className="space-y-1 px-3" role="navigation">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all active:scale-98 font-medium"
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Home</span>
              </Link>

              <Link
                href="/plans"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all active:scale-98 font-medium"
              >
                <Package className="w-5 h-5 shrink-0" />
                <span>Plans</span>
              </Link>

              <Link
                href="/blog"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all active:scale-98 font-medium"
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span>Blog</span>
              </Link>

              <Link
                href="/faq"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all active:scale-98 font-medium"
              >
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>FAQ</span>
              </Link>

              <a
                href="#support"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all active:scale-98 font-medium"
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
                  className="flex items-center gap-3 px-4 py-3.5 mx-1 text-white bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-xl transition-all active:scale-98 font-semibold shadow-md hover:shadow-lg"
                >
                  <Package className="w-5 h-5 shrink-0" />
                  <span>My Orders</span>
                </Link>
              )}
            </nav>
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
