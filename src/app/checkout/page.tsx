"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/currency-provider";

// Dynamically import to avoid HMR issues with Turbopack
const EmbeddedCheckoutForm = dynamic(
  () => import("@/components/embedded-checkout-form").then((mod) => ({ default: mod.EmbeddedCheckoutForm })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }
);

// Load Stripe with your publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("product");
  const productName = searchParams.get("name") || offerId || "eSIM Plan";
  const priceParam = searchParams.get("price") || "0.00";
  
  // Parse price from URL (format: "CURRENCY AMOUNT" or just amount)
  const priceMatch = priceParam.match(/^([A-Z]{3})\s+([\d.]+)$/);
  const originalCurrency = priceMatch ? priceMatch[1] : "USD";
  const originalAmount = priceMatch ? parseFloat(priceMatch[2]) : parseFloat(priceParam.replace(/[^0-9.]/g, ""));
  
  const { convertPrice, formatCurrency } = useCurrency();
  
  // Display price in user's selected currency (for display only)
  const displayPrice = priceMatch && originalAmount 
    ? convertPrice(originalAmount, originalCurrency)
    : priceParam;
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPaymentIntent() {
      if (!offerId) return;
    if (!stripePublishableKey) {
      setError("Payment system is not configured. Please contact support.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to initialize payment");
      }

      if (!data.clientSecret) {
        throw new Error("Invalid response from server");
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      } finally {
      setLoading(false);
    }
  }

    initPaymentIntent();
  }, [offerId]);

  if (!offerId) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-900 mb-2">Invalid Request</h1>
          <p className="text-red-700">No product selected. Please return to the home page.</p>
          <a href="/" className="inline-block mt-4 text-sky-600 hover:text-sky-700 font-medium">
            ← Back to Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <AnimatePresence mode="wait">
        {(!clientSecret || loading) ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 dark:text-gray-300">
                {error ? error : "Preparing secure payment..."}
              </p>
              {error && (
                <button
                  className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        ) : stripePromise ? (
          // Stripe Payment Form
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0284c7",
                  colorBackground: "#ffffff",
                  colorText: "#1f2937",
                  colorDanger: "#dc2626",
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <EmbeddedCheckoutForm
              productName={productName}
              price={priceParam}
              productName={productName}
              price={priceParam}
              onSuccess={() => {
                console.log("Payment successful");
              }}
              onCancel={() => {
                setClientSecret(null);
                setError(null);
                setLoading(false);
              }}
            />
          </Elements>
        ) : (
          // Stripe not configured
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                  Payment System Unavailable
                </h2>
                <p className="text-red-800 dark:text-red-300 mb-4">
                  The payment system is not configured. Please contact support for assistance.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-sky-600 dark:bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
