"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PromotionalBannerProps {
  className?: string;
  showCountdown?: boolean;
  position?: "top" | "bottom";
}

interface PromoStatus {
  active: boolean;
  name?: string;
  discountPercent?: number;
  endsAt?: string; // ISO timestamp
}

/**
 * Promotional Banner Component
 * 
 * Displays a promotional banner during active promotions:
 * - Shows only during active promo window
 * - Displays "🌙 Ramadan Blessing – 10% off Umrah eSIMs"
 * - Optional countdown timer until promo ends
 * - Dismissible (session-based using sessionStorage)
 * - Lightweight and performant
 */
export function PromotionalBanner({
  className = "",
  showCountdown = true,
  position = "top",
}: PromotionalBannerProps) {
  const [promoStatus, setPromoStatus] = useState<PromoStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo-banner-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  // Fetch active promotion status
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function checkPromoStatus() {
      try {
        // Use lightweight endpoint for fast status checks
        const response = await fetch("/api/promotions/active", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store", // Always fetch fresh data
        });

        if (!response.ok) {
          if (isMounted) {
            setIsLoading(false);
            setPromoStatus({ active: false });
          }
          return;
        }

        const data: PromoStatus = await response.json();

        if (isMounted) {
          setPromoStatus(data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setPromoStatus({ active: false });
          setIsLoading(false);
        }
      }
    }

    checkPromoStatus();

    // Refresh promo status every 5 minutes
    intervalId = setInterval(checkPromoStatus, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    if (!showCountdown || !promoStatus?.active || !promoStatus.endsAt) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(promoStatus.endsAt!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("");
        setPromoStatus({ active: false });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [showCountdown, promoStatus]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    sessionStorage.setItem("promo-banner-dismissed", "true");
  }, []);

  // Don't render if loading, dismissed, or no active promo
  if (isLoading || isDismissed || !promoStatus?.active) {
    return null;
  }

  const isRamadan = promoStatus.name?.toLowerCase().includes("ramadan");
  const discountText = promoStatus.discountPercent
    ? `${promoStatus.discountPercent}% off`
    : "Special offer";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === "top" ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === "top" ? -20 : 20 }}
        transition={{ duration: 0.3 }}
        className={`fixed ${position === "top" ? "top-0" : "bottom-0"} left-0 right-0 z-50 ${className}`}
        role="banner"
        aria-label="Promotional offer"
      >
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 sm:gap-4 py-2.5 sm:py-3">
              {/* Message */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="text-lg sm:text-xl leading-none flex-shrink-0" aria-hidden="true">
                  🌙
                </span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {isRamadan ? "Ramadan Blessing" : "Special Offer"} – {discountText} Umrah eSIMs
                  </span>
                  {showCountdown && timeRemaining && (
                    <span className="text-xs sm:text-sm font-medium bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Ends in {timeRemaining}
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1.5 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-500"
                aria-label="Dismiss promotional banner"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
