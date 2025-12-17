"use client";

import React, { useState } from "react";

export type PaymentFormData = {
  email?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
};

type PaymentMethod = "cards" | "digital-wallets" | "upi" | "bnpl-services";

export function PaymentMethodSelector({
  onProceed,
  className,
}: {
  onProceed: (method: PaymentMethod, data: PaymentFormData) => void | Promise<void>;
  className?: string;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  function handleProceed() {
    if (!method) return;

    const data: PaymentFormData = {
      email: email || undefined,
      cardholderName: name || undefined,
    };

    onProceed(method, data);
  }

  return (
    <div className={className}>
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Choose a payment method</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            className={`p-4 border rounded text-left transition-colors ${
              method === "cards" 
                ? "border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30" 
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
            onClick={() => setMethod("cards")}
          >
            <div className="font-medium text-gray-900 dark:text-white">Card</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pay with debit or credit card (Stripe)</div>
          </button>

          <button
            className={`p-4 border rounded text-left transition-colors ${
              method === "digital-wallets" 
                ? "border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30" 
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
            onClick={() => setMethod("digital-wallets")}
          >
            <div className="font-medium text-gray-900 dark:text-white">Digital Wallet</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Apple Pay / Google Pay</div>
          </button>

          <button
            className={`p-4 border rounded text-left transition-colors ${
              method === "upi" 
                ? "border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30" 
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
            onClick={() => setMethod("upi")}
          >
            <div className="font-medium text-gray-900 dark:text-white">UPI</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">UPI payments</div>
          </button>

          <button
            className={`p-4 border rounded text-left transition-colors ${
              method === "bnpl-services" 
                ? "border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30" 
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
            onClick={() => setMethod("bnpl-services")}
          >
            <div className="font-medium text-gray-900 dark:text-white">Buy Now, Pay Later</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pay in installments</div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </label>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleProceed}
            className="px-5 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!method}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
