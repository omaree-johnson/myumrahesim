"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { PaymentSuccessDialog } from "@/components/payment-success-dialog";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const [transactionId, setTransactionId] = useState(searchParams.get("transactionId"));
  const [productName, setProductName] = useState(searchParams.get("product") || "eSIM Plan");
  const [price, setPrice] = useState(searchParams.get("price") || "0.00");
  const [currency, setCurrency] = useState("USD");
  
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(!!(sessionId || paymentIntentId));
  const [processingMessage, setProcessingMessage] = useState("Processing your payment...");

  // Poll for transaction ID if we have a Stripe session ID or payment intent ID
  useEffect(() => {
    if ((sessionId || paymentIntentId) && !transactionId) {
      let pollCount = 0;
      const maxPolls = 30; // Poll for up to 30 seconds
      
      const pollForTransaction = async () => {
        try {
          // Build query string based on what we have
          const queryParam = sessionId 
            ? `session_id=${sessionId}` 
            : `payment_intent=${paymentIntentId}`;
          
          const res = await fetch(`/api/purchases/by-session?${queryParam}`);
          const data = await res.json();

          if (res.status === 202) {
            // Still processing
            setProcessingMessage(data.message || "Processing your order...");
            pollCount++;
            
            if (pollCount < maxPolls) {
              // Poll again in 2 seconds
              setTimeout(pollForTransaction, 2000);
            } else {
              // Give up after max polls
              setProcessingMessage("Taking longer than expected. Check your email for confirmation.");
              setLoading(false);
            }
          } else if (res.ok && data.transactionId) {
            // Transaction found!
            setTransactionId(data.transactionId);
            
            // Extract price and product name from purchase data if available
            if (data.priceAmount !== undefined && data.priceAmount !== null) {
              setPrice(`${data.priceAmount.toFixed(2)}`);
            }
            if (data.priceCurrency) {
              setCurrency(data.priceCurrency);
            }
            if (data.productName) {
              setProductName(data.productName);
            }
            
            setLoading(false);
          } else {
            // Error
            console.error('Error fetching transaction:', data);
            setLoading(false);
          }
        } catch (error) {
          console.error('Failed to poll for transaction:', error);
          setLoading(false);
        }
      };

      pollForTransaction();
    } else if (transactionId) {
      setLoading(false);
    }
  }, [sessionId, paymentIntentId, transactionId]);

  // Auto-open dialog when we have transaction ID
  useEffect(() => {
    if (transactionId && !loading) {
      setShowDialog(true);
    }
  }, [transactionId, loading]);

  // Get currency symbol
  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'MXN': 'MX$',
      'BRL': 'R$',
      'ZAR': 'R',
      'SAR': 'SR',
      'AED': 'د.إ',
    };
    return symbols[curr.toUpperCase()] || curr.toUpperCase() + ' ';
  };

  return (
    <>
      {loading ? (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                {processingMessage}
              </p>
            </div>

            {(sessionId || paymentIntentId) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">{sessionId ? 'Payment Session' : 'Payment Intent'}</p>
                <p className="text-xs font-mono text-gray-900 break-all">{sessionId || paymentIntentId}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              This usually takes a few seconds. Please don't close this page.
            </div>
          </div>
        </div>
      ) : (
        <>
          {transactionId && (
            <PaymentSuccessDialog
              open={showDialog}
              onOpenChange={setShowDialog}
              price={price}
              currencySymbol={getCurrencySymbol(currency)}
              productName={productName}
              transactionId={transactionId}
              onProceed={() => {
                router.push(`/activation?transactionId=${transactionId}`);
              }}
              onBack={() => {
                router.push("/");
              }}
            />
          )}

          {/* Fallback content if dialog is closed */}
          {!showDialog && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Purchase Successful!
              </h1>
              <p className="text-gray-600">
                Your eSIM has been purchased. Activation details will be available shortly.
              </p>
            </div>

            {transactionId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-lg font-mono font-semibold text-gray-900 break-all">{transactionId}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Save this ID to track your purchase status
                </p>
              </div>
            )}

        <div className="space-y-4 text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900">What's Next?</h2>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-sky-600">1.</span>
              <span>Check your email for the eSIM QR code and activation instructions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-sky-600">2.</span>
              <span>Scan the QR code with your device or use the activation code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-sky-600">3.</span>
              <span>Enable the eSIM in your device settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-sky-600">4.</span>
              <span>Start using your data plan immediately</span>
            </li>
          </ol>
        </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse More Plans
              </a>
              <a
                href="#support"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
          )}
        </>
      )}
    </>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
