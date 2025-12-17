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
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 lg:p-8">
      <h2 className="text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3 text-gray-900 dark:text-white">{title || "Pay with card"}</h2>
      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 lg:mb-6">{description}</p>

      <div className="text-xl lg:text-2xl font-bold text-sky-600 dark:text-sky-400 mb-4 lg:mb-6">{currencySymbol}{price}</div>

      <form onSubmit={submit} className="space-y-4 lg:space-y-5">
        <label className="block">
          <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">Cardholder Name</span>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="mt-1.5 lg:mt-2 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-3 text-base lg:text-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
          />
        </label>

        <label className="block">
          <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">Card Number</span>
          <input 
            value={number} 
            onChange={(e) => setNumber(e.target.value)} 
            inputMode="numeric" 
            placeholder="4242 4242 4242 4242" 
            className="mt-1.5 lg:mt-2 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 text-base lg:text-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
          />
        </label>

        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <label className="block">
            <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">Expiry (MM/YY)</span>
            <input 
              value={expiry} 
              onChange={(e) => setExpiry(e.target.value)} 
              placeholder="04/25" 
              className="mt-1.5 lg:mt-2 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 text-base lg:text-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
            />
          </label>

          <label className="block col-span-2">
            <span className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">CVC</span>
            <input 
              value={cvc} 
              onChange={(e) => setCvc(e.target.value)} 
              placeholder="123" 
              inputMode="numeric" 
              className="mt-1.5 lg:mt-2 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 text-base lg:text-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
            />
          </label>
        </div>

        <div className="flex items-center justify-between mt-5 lg:mt-6">
          <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            {finalText?.map((t, i) => (
              <div key={i}>{t.text}</div>
            ))}
          </div>

          <button className="px-6 lg:px-8 py-2.5 lg:py-3 bg-sky-600 dark:bg-sky-500 text-white text-base lg:text-lg font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors">Pay</button>
        </div>
      </form>

      {feature && (
        <div className="mt-4 lg:mt-6 p-4 lg:p-5 bg-sky-50 dark:bg-sky-900/30 rounded-lg border border-sky-100 dark:border-sky-800">
          <div className="font-semibold lg:text-lg text-gray-900 dark:text-white">{feature}</div>
          <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">{featuredescription}</div>
        </div>
      )}

      {feature2 && (
        <div className="mt-3 lg:mt-4 p-4 lg:p-5 bg-sky-50 dark:bg-sky-900/30 rounded-lg border border-sky-100 dark:border-sky-800">
          <div className="font-semibold lg:text-lg text-gray-900 dark:text-white">{feature2}</div>
          <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">{feature2description}</div>
        </div>
      )}
    </div>
  );
}

export default PaymentCard;
