"use client";

import { useState, FormEvent, memo } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

interface EmbeddedCheckoutFormProps {
  productName: string;
  price: string;
  onSuccess: () => void;
  onCancel: () => void;
  clientSecret?: string;
  customerEmail?: string;
  customerName?: string;
}

function EmbeddedCheckoutFormComponent({
  productName,
  price,
  onSuccess,
  onCancel,
  clientSecret,
  customerEmail,
  customerName,
}: EmbeddedCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Email and name should already be provided from step 1
    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage("Email is required. Please go back and enter your email.");
      setIsProcessing(false);
      return;
    }

    try {
      // Payment intent should already have email/name from creation, but verify
      if (!clientSecret) {
        throw new Error('Payment system not ready. Please refresh and try again.');
      }

      // Confirm payment - email/name are already in payment intent metadata
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?payment_intent={PAYMENT_INTENT_CLIENT_SECRET}`,
          payment_method_data: {
            billing_details: {
              email: customerEmail.trim(),
              name: customerName?.trim() || undefined,
            },
          },
        },
        redirect: 'if_required', // Only redirect if required by payment method
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred. Please try again.");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect - navigate manually
        window.location.href = `/success?payment_intent=${paymentIntent.id}`;
      } else {
        // Payment requires redirect - Stripe will handle it
        onSuccess();
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Product Summary */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h2>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-medium text-gray-900">{productName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-sky-600">
                {price.includes('$') || price.match(/^[A-Z]{3}\s+[\d.]+$/) ? price : `$${price}`}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Customer Info Display (from step 1) */}
          {customerEmail && (
            <div className="mb-6 p-4 bg-sky-50 border-2 border-sky-200 rounded-lg">
              <p className="text-sm font-medium text-sky-900 mb-2">
                📧 Confirmation will be sent to: <span className="font-semibold">{customerEmail}</span>
              </p>
              {customerName && (
                <p className="text-sm text-sky-700">
                  👤 Traveler: <span className="font-semibold">{customerName}</span>
                </p>
              )}
            </div>
          )}

          {/* Stripe Payment Element - No email/name fields needed */}
          <div className="mb-6">
            <PaymentElement
              options={{
                layout: "tabs",
                wallets: {
                  applePay: "auto",
                  googlePay: "auto",
                },
              }}
            />
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-800">{errorMessage}</p>
            </motion.div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ${price.includes('$') || price.match(/^[A-Z]{3}\s+[\d.]+$/) ? price : `$${price}`}`
              )}
            </button>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Instant activation guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure payment powered by Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8/5 rating (150 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Export both named and default for better HMR compatibility
export const EmbeddedCheckoutForm = memo(EmbeddedCheckoutFormComponent);
export default EmbeddedCheckoutForm;
