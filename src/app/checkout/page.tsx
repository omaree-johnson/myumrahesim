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
  
  // Two-step flow state
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Name/Email, Step 2: Payment
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize payment intent only when we have email/name (step 2)
  useEffect(() => {
    async function initPaymentIntent() {
      if (step !== 2 || !offerId || !customerEmail || !customerName) return;
      if (!stripePublishableKey) {
        setError(`Payment system is not configured. Please contact support at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}.`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            offerId,
            recipientEmail: customerEmail,
            fullName: customerName,
          }),
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
  }, [step, offerId, customerEmail, customerName]);

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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    
    setError(null);
    setStep(2); // Move to payment step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          // Step 1: Collect Name and Email
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Your Purchase
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {productName} - {displayPrice}
              </p>

              <form onSubmit={handleStep1Submit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white"
                      required
                      autoComplete="email"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Your eSIM activation details will be sent to this email
                    </p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (!clientSecret || loading) ? (
          // Loading payment form
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
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                >
                  Go Back
                </button>
              )}
            </div>
          </motion.div>
        ) : stripePromise ? (
          // Step 2: Stripe Payment Form
          <Elements
            key="payment"
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
              clientSecret={clientSecret}
              customerEmail={customerEmail}
              customerName={customerName}
              onSuccess={() => {
                console.log("Payment successful");
              }}
              onCancel={() => {
                setStep(1);
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
                  The payment system is not configured. Please contact support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`} className="text-sky-600 dark:text-sky-400 underline">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}</a> for assistance.
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
