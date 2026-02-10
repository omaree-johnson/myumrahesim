"use client";

import { X, ShoppingCart, CheckCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
}

export function CartConfirmationModal({
  isOpen,
  onClose,
  itemName,
}: CartConfirmationModalProps) {
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout?cart=1");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  const handleKeepShopping = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal: match app cards (border, rounded-xl, sky accents) */}
      <div
        className="relative w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Success icon: sky to match primary CTA */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <CheckCircle className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Added to cart
          </h3>

          {itemName && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {itemName}
            </p>
          )}

          {/* Buttons: same styles as plans page (outline sky, gradient primary) */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckout}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-500 dark:to-sky-600 hover:from-sky-700 hover:to-sky-800 dark:hover:from-sky-600 dark:hover:to-sky-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Go to checkout
            </button>
            <button
              type="button"
              onClick={handleViewCart}
              className="w-full px-6 py-3.5 border-2 border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 font-bold rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              View cart
            </button>
            <button
              onClick={handleKeepShopping}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Keep shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
