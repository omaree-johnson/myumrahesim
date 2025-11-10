"use client";

import React, { useState } from "react";

export function PaymentCard({
  title,
  description,
  price,
  currencySymbol,
  finalText,
  feature,
  featuredescription,
  feature2,
  feature2description,
  onPay,
}: {
  title?: string;
  description?: string;
  price?: string | number;
  currencySymbol?: string;
  finalText?: Array<{ text: string }>;
  feature?: string;
  featuredescription?: string;
  feature2?: string;
  feature2description?: string;
  onPay: (data: { cardNumber: string; expiry: string; cvc: string; name: string }) => void | Promise<void>;
}) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await onPay({ cardNumber: number, expiry, cvc, name });
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-2">{title || "Pay with card"}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <div className="text-xl font-bold text-sky-600 mb-4">{currencySymbol}{price}</div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-700">Cardholder Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded border-gray-200" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Card Number</span>
          <input value={number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" placeholder="4242 4242 4242 4242" className="mt-1 block w-full rounded border-gray-200" />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-gray-700">Expiry (MM/YY)</span>
            <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="04/25" className="mt-1 block w-full rounded border-gray-200" />
          </label>

          <label className="block col-span-2">
            <span className="text-sm text-gray-700">CVC</span>
            <input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" inputMode="numeric" className="mt-1 block w-full rounded border-gray-200" />
          </label>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {finalText?.map((t, i) => (
              <div key={i}>{t.text}</div>
            ))}
          </div>

          <button className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Pay</button>
        </div>
      </form>

      {feature && (
        <div className="mt-4 p-3 bg-sky-50 rounded">
          <div className="font-medium">{feature}</div>
          <div className="text-sm text-gray-600">{featuredescription}</div>
        </div>
      )}

      {feature2 && (
        <div className="mt-2 p-3 bg-sky-50 rounded">
          <div className="font-medium">{feature2}</div>
          <div className="text-sm text-gray-600">{feature2description}</div>
        </div>
      )}
    </div>
  );
}

export default PaymentCard;
