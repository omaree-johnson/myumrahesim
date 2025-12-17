"use client";

import { CheckCircle } from "lucide-react";

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  currencySymbol?: string;
  price: string;
  productName: string;
  transactionId?: string;
  proceedButtonText?: string;
  backButtonText?: string;
  onProceed?: () => void;
  onBack?: () => void;
  className?: string;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
  title = "Purchase Successful!",
  subtitle = "Your eSIM has been activated and is ready to use.",
  currencySymbol = "$",
  price,
  productName,
  transactionId,
  proceedButtonText = "View Activation Details",
  backButtonText = "Browse More Plans",
  onProceed,
  onBack,
  className = "",
}: PaymentSuccessDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
        {/* Success Animation Background */}
        <div className="absolute inset-0 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 opacity-60" />
        
        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {subtitle}
          </p>

          {/* Amount Box */}
          <div className="bg-white dark:bg-slate-700 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg text-gray-700 dark:text-gray-300">{currencySymbol}</span>
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">{price}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">{productName}</p>
          </div>

          {/* Transaction ID */}
          {transactionId && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{transactionId}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="text-left bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">What's Next:</p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span>Check your email for activation QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span>Scan QR code on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span>Start using your data instantly</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onProceed && (
              <button
                onClick={() => {
                  onProceed();
                  onOpenChange(false);
                }}
                className="flex-1 py-3 px-6 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {proceedButtonText}
              </button>
            )}
            {onBack && (
              <button
                onClick={() => {
                  onBack();
                  onOpenChange(false);
                }}
                className="flex-1 py-3 px-6 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg border-2 border-gray-300 dark:border-slate-600 transition-all"
              >
                {backButtonText}
              </button>
            )}
          </div>

          {/* Close text */}
          <button
            onClick={() => onOpenChange(false)}
            className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
