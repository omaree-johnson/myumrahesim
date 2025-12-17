"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useEffect, useMemo, useState } from "react";

function parsePriceLabel(priceLabel: string): { currency: string; amount: number } | null {
  // Accept "USD 14.95" or "$14.95" (fallback assumes USD)
  const m = priceLabel.match(/^([A-Z]{3})\s+([\d.]+)$/);
  if (m) return { currency: m[1], amount: parseFloat(m[2]) };
  const num = priceLabel.match(/[\d.]+/);
  if (!num) return null;
  return { currency: "USD", amount: parseFloat(num[0]) };
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, totalItems, setQuantity, removeItem, clear, replace } = useCart();

  const restoreToken = searchParams.get("restore");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [cartToken, setCartToken] = useState<string | null>(null);

  const CART_TOKEN_STORAGE_KEY = "umrahesim-cart-token-v1";

  const totals = useMemo(() => items.reduce(
    (acc, item) => {
      const parsed = parsePriceLabel(item.priceLabel);
      if (!parsed) return acc;
      // NOTE: prices displayed may be converted elsewhere; checkout recalculates server-side.
      acc.currency = acc.currency || parsed.currency;
      acc.amount += parsed.amount * item.quantity;
      return acc;
    },
    { currency: "" as string, amount: 0 },
  ), [items]);

  useEffect(() => {
    try {
      setCartToken(localStorage.getItem(CART_TOKEN_STORAGE_KEY));
    } catch {}
  }, []);

  useEffect(() => {
    async function restore() {
      if (!restoreToken) return;
      setRestoring(true);
      setRestoreError(null);
      try {
        const res = await fetch(`/api/cart/restore?token=${encodeURIComponent(restoreToken)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to restore cart");
        if (!Array.isArray(data.items)) throw new Error("Invalid restore payload");

        // Replace cart items with server-stored items
        replace(data.items);

        // Persist token for checkout cancellation of reminders
        if (data.token) {
          localStorage.setItem(CART_TOKEN_STORAGE_KEY, String(data.token));
          setCartToken(String(data.token));
        }

        if (data.email) setReminderEmail(String(data.email));
        setReminderStatus("Cart restored.");
      } catch (e: any) {
        setRestoreError(e?.message || "Failed to restore cart");
      } finally {
        setRestoring(false);
      }
    }
    restore();
  }, [restoreToken, replace]);

  async function handleEmailCart() {
    setReminderLoading(true);
    setReminderStatus(null);
    try {
      const res = await fetch("/api/cart/reminders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: reminderEmail,
          token: cartToken,
          items: items.map((i) => ({
            offerId: i.offerId,
            name: i.name,
            priceLabel: i.priceLabel,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to schedule reminders");
      if (data.token) {
        localStorage.setItem(CART_TOKEN_STORAGE_KEY, String(data.token));
        setCartToken(String(data.token));
      }
      setReminderStatus("We’ll email you a reminder if you don’t checkout.");
    } catch (e: any) {
      setReminderStatus(e?.message || "Failed to schedule reminders");
    } finally {
      setReminderLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cart</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? "s" : ""}` : "Your cart is empty"}
          </p>
        </div>
        {totalItems > 0 && (
          <button
            onClick={clear}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white underline"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
            <ShoppingCart className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">Add one or more eSIM plans to checkout together.</p>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg"
          >
            Browse plans
          </Link>
        </div>
      ) : (
        <>
          {(restoring || restoreError) && (
            <div className="mb-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              {restoring ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">Restoring your cart…</p>
              ) : restoreError ? (
                <p className="text-sm text-red-700 dark:text-red-300">{restoreError}</p>
              ) : null}
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {items.map((item) => (
                <li key={item.offerId} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.priceLabel}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                        {item.offerId}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-slate-700">
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          onClick={() => setQuantity(item.offerId, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          onClick={() => setQuantity(item.offerId, Math.min(10, item.quantity + 1))}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={() => removeItem(item.offerId)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <p className="font-semibold text-gray-900 dark:text-white">Get a reminder (optional)</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Enter your email and we’ll remind you if you forget to finish checkout.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <input
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                disabled={reminderLoading || !reminderEmail}
                onClick={handleEmailCart}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-lg"
              >
                {reminderLoading ? "Saving…" : "Email my cart"}
              </button>
            </div>
            {reminderStatus && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{reminderStatus}</p>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Link
              href="/plans"
              className="inline-flex items-center justify-center px-5 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30"
            >
              Add another plan
            </Link>
            <button
              onClick={() => router.push(`/checkout?cart=1${cartToken ? `&cartToken=${encodeURIComponent(cartToken)}` : ""}`)}
              className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg"
            >
              Checkout {totals.currency ? `(${totals.currency} ${totals.amount.toFixed(2)})` : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

