"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/currency-provider";
import { EmbeddedCheckoutForm } from "@/components/embedded-checkout-form";
import { useCart } from "@/components/cart-provider";


function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartMode = searchParams.get("cart") === "1";
  const topupMode = searchParams.get("topup") === "1";
  const offerId = searchParams.get("product");
  const topupIccid = searchParams.get("iccid");
  const topupPackageCode = searchParams.get("packageCode");
  const cartToken = searchParams.get("cartToken");
  const discountFromUrl = searchParams.get("discount");
  const productName = searchParams.get("name") || offerId || "eSIM Plan";
  const priceParam = searchParams.get("price") || "0.00";
  const { items: cartItems, clear: clearCart } = useCart();
  
  // Parse price from URL (format: "CURRENCY AMOUNT" or just amount)
  const priceMatch = priceParam.match(/^([A-Z]{3})\s+([\d.]+)$/);
  const originalCurrency = priceMatch ? priceMatch[1] : "USD";
  const originalAmount = priceMatch ? parseFloat(priceMatch[2]) : parseFloat(priceParam.replace(/[^0-9.]/g, ""));
  
  const { convertPrice, formatCurrency } = useCurrency();
  
  // Display price in user's selected currency (for display only)
  const displayPrice = priceMatch && originalAmount 
    ? convertPrice(originalAmount, originalCurrency)
    : priceParam;
  
  // Load Stripe with your publishable key (moved inside component to avoid HMR issues)
  const stripePublishableKey = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null)
    : null;
  
  const stripePromise = useMemo(() => {
    if (!stripePublishableKey) {
      console.error('[Stripe] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
      return null;
    }
    
    try {
      // loadStripe returns a Promise that resolves to the Stripe instance
      // The Elements component will handle waiting for this promise
      return loadStripe(stripePublishableKey);
    } catch (error) {
      console.error('[Stripe] Failed to initialize Stripe:', error);
      return null;
    }
  }, [stripePublishableKey]);
  
  // Monitor Stripe loading status
  useEffect(() => {
    if (stripePromise) {
      stripePromise
        .then((stripe) => {
          if (stripe) {
            setStripeLoaded(true);
          } else {
            console.error('[Stripe] Stripe loaded but returned null');
            setError('Failed to load payment system. Please refresh the page.');
          }
        })
        .catch((error) => {
          console.error('[Stripe] Failed to load Stripe.js:', error);
          setError('Failed to load payment system. Please check your internet connection and refresh the page.');
        });
    }
  }, [stripePromise]);
  
  // Two-step flow state
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Name/Email, Step 2: Payment
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discountCode, setDiscountCode] = useState(discountFromUrl || "");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutTitle, setCheckoutTitle] = useState(productName);
  const [checkoutPriceLabel, setCheckoutPriceLabel] = useState(priceParam);
  const [volumeDiscount, setVolumeDiscount] = useState<{ percent: number; threshold: string } | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Initialize payment intent only when we have email/name (step 2)
  useEffect(() => {
    async function initPaymentIntent() {
      if (step !== 2 || !customerEmail || !customerName) return;
      if (!stripePublishableKey) {
        setError(`Payment system is not configured. Missing Stripe publishable key. Please contact support at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}.`);
        return;
      }
      
      // Check if Stripe.js loaded successfully
      if (!stripePromise) {
        setError(`Failed to load payment system. Please refresh the page and try again.`);
        return;
      }

      if (cartMode) {
        if (!cartItems || cartItems.length === 0) {
          setError("Your cart is empty. Please add a plan first.");
          return;
        }
      } else if (topupMode) {
        if (!topupIccid || !topupPackageCode) {
          setError("Missing top up details. Please open the top up link again.");
          return;
        }
      } else {
        if (!offerId) return;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = cartMode
          ? "/api/create-cart-payment-intent"
          : topupMode
            ? "/api/create-topup-payment-intent"
            : "/api/create-payment-intent";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...(cartMode
              ? {
                  items: cartItems.map((i) => ({ offerId: i.offerId, quantity: i.quantity })),
                  ...(cartToken ? { cartToken } : {}),
                }
              : topupMode
                ? { iccid: topupIccid, packageCode: topupPackageCode }
                : { offerId }),
            recipientEmail: customerEmail,
            fullName: customerName,
            ...(discountCode ? { discountCode } : {}),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to initialize payment");
        }

        if (!data.clientSecret) {
          throw new Error("Invalid response from server");
        }

        if (cartMode && data.summary) {
          setCheckoutTitle(`Cart (${data.summary.totalQuantity} eSIM${data.summary.totalQuantity !== 1 ? "s" : ""})`);
          const total = data.summary.finalPrice;
          const original = data.summary.originalPrice;
          setCheckoutPriceLabel(
            original && original !== total ? `${data.summary.currency} ${total} (was ${original})` : `${data.summary.currency} ${total}`,
          );
          // Set volume discount if available
          if (data.summary.volumeDiscount) {
            setVolumeDiscount({
              percent: data.summary.volumeDiscount.percent,
              threshold: data.summary.volumeDiscount.threshold,
            });
          } else {
            setVolumeDiscount(null);
          }
        } else if (topupMode && data.summary) {
          setCheckoutTitle(`Top Up (${data.summary.packageCode})`);
          setCheckoutPriceLabel(
            data.summary.originalPrice
              ? `${data.summary.currency} ${data.summary.price} (was ${data.summary.originalPrice})`
              : `${data.summary.currency} ${data.summary.price}`,
          );
          setVolumeDiscount(null);
        } else {
          setCheckoutTitle(productName);
          // If server returned discount totals, surface them
          if (data.productDetails?.totalAfterDiscount && data.productDetails?.currency) {
            const cur = String(data.productDetails.currency || "USD").toUpperCase();
            const after = data.productDetails.totalAfterDiscount;
            const was = data.productDetails.price ? Number(data.productDetails.price).toFixed(2) : null;
            setCheckoutPriceLabel(was && was !== after ? `${cur} ${after} (was ${was})` : `${cur} ${after}`);
          } else {
            setCheckoutPriceLabel(priceParam);
          }
          // Set volume discount if available
          if (data.productDetails?.volumeDiscount) {
            setVolumeDiscount({
              percent: data.productDetails.volumeDiscount.percent,
              threshold: data.productDetails.volumeDiscount.threshold,
            });
          } else {
            setVolumeDiscount(null);
          }
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    initPaymentIntent();
  }, [step, offerId, customerEmail, customerName, cartMode, cartItems, topupMode, topupIccid, topupPackageCode, productName, priceParam, discountCode, cartToken, stripePublishableKey]);

  if (!cartMode && !topupMode && !offerId) {
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
                {(cartMode || topupMode) ? `${checkoutTitle} - ${checkoutPriceLabel}` : `${productName} - ${displayPrice}`}
              </p>
              {volumeDiscount && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    <span className="font-semibold">Volume Discount Applied:</span> {volumeDiscount.percent}% off (orders over ${volumeDiscount.threshold})
                  </p>
                </div>
              )}

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

                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Code <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="discount"
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="e.g. REVIEW-ABC123"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white"
                      autoComplete="off"
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
              productName={(cartMode || topupMode) ? checkoutTitle : productName}
              price={(cartMode || topupMode) ? checkoutPriceLabel : priceParam}
              clientSecret={clientSecret}
              customerEmail={customerEmail}
              customerName={customerName}
              onSuccess={() => {
                if (cartMode) {
                  clearCart();
                  try {
                    localStorage.removeItem("umrahesim-cart-token-v1");
                  } catch {}
                }
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
          // Stripe not configured or failed to load
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
                  {!stripePublishableKey ? (
                    <>
                      The payment system is not configured. Missing Stripe publishable key.
                      {process.env.NODE_ENV === 'development' && (
                        <span className="block mt-2 text-sm">
                          Please ensure <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is set in your <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">.env.local</code> file.
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Failed to load Stripe.js. This may be due to:
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Network connectivity issues</li>
                        <li>Content Security Policy blocking Stripe scripts</li>
                        <li>Invalid Stripe publishable key</li>
                      </ul>
                    </>
                  )}
                </p>
                <p className="text-red-700 dark:text-red-400 mb-4 text-sm">
                  Please contact support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`} className="text-sky-600 dark:text-sky-400 underline">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}</a> for assistance.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-sky-600 dark:bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
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
