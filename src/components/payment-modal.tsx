"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; fullName: string }) => Promise<void>;
  productName: string;
  price: string;
  offerId: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  productName,
  price,
  offerId,
}: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({ email, fullName });
      // Success - parent will handle redirect
    } catch (err: any) {
      setError(err.message || "Failed to process purchase");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 lg:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-4xl lg:max-w-5xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-0 sm:absolute sm:top-4 sm:right-4 lg:top-6 lg:right-6 ml-auto mr-4 mt-4 sm:m-0 p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors z-10 bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8">
          {/* Left side - Form */}
          <div className="order-2 md:order-1">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Your Purchase
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Enter your details to activate your eSIM instantly
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  autoComplete="email"
                  inputMode="email"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Your eSIM activation details will be sent here
                </p>
              </div>

              {/* Offer ID (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Code
                </label>
                <input
                  type="text"
                  value={offerId}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-sm font-mono"
                  readOnly
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-800 dark:text-red-200 text-sm font-semibold mb-1">Error</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-sky-600 active:bg-sky-700 sm:hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all transform active:scale-[0.98] shadow-lg touch-manipulation text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Complete Purchase"
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Your purchase will be processed securely through our eSIM provider
              </p>
            </form>
          </div>

          {/* Right side - Summary */}
          <div className="order-1 md:order-2 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl p-4 sm:p-6 h-fit md:sticky md:top-0 border border-sky-100 dark:border-sky-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</p>
                <p className="font-semibold text-gray-900 dark:text-white">{productName}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                  <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{price}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300">Instant activation</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300">QR code sent via email</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300">24/7 customer support</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300">No hidden fees</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
