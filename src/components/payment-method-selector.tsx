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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Choose a payment method</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            className={`p-4 border rounded text-left ${method === "cards" ? "border-sky-600 bg-sky-50" : "bg-white"}`}
            onClick={() => setMethod("cards")}
          >
            <div className="font-medium">Card</div>
            <div className="text-sm text-gray-500">Pay with debit or credit card (Stripe)</div>
          </button>

          <button
            className={`p-4 border rounded text-left ${method === "digital-wallets" ? "border-sky-600 bg-sky-50" : "bg-white"}`}
            onClick={() => setMethod("digital-wallets")}
          >
            <div className="font-medium">Digital Wallet</div>
            <div className="text-sm text-gray-500">Apple Pay / Google Pay</div>
          </button>

          <button
            className={`p-4 border rounded text-left ${method === "upi" ? "border-sky-600 bg-sky-50" : "bg-white"}`}
            onClick={() => setMethod("upi")}
          >
            <div className="font-medium">UPI</div>
            <div className="text-sm text-gray-500">UPI payments</div>
          </button>

          <button
            className={`p-4 border rounded text-left ${method === "bnpl-services" ? "border-sky-600 bg-sky-50" : "bg-white"}`}
            onClick={() => setMethod("bnpl-services")}
          >
            <div className="font-medium">Buy Now, Pay Later</div>
            <div className="text-sm text-gray-500">Pay in installments</div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200"
            />
          </label>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleProceed}
            className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
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
