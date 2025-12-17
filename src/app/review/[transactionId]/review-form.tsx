"use client";

import { useState } from "react";

export default function ReviewForm({ transactionId }: { transactionId: string }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercentOff, setDiscountPercentOff] = useState<number | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId,
          rating,
          title,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit review");
      setDiscountCode(data.discountCode || null);
      setDiscountPercentOff(typeof data.discountPercentOff === "number" ? data.discountPercentOff : null);
    } catch (err: any) {
      setError(err?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (discountCode) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thanks for your review!</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here’s your {discountPercentOff ? `${discountPercentOff}%` : ""} discount code:
        </p>
        <div className="mt-4 rounded-lg bg-slate-900 text-white px-4 py-3 font-mono text-lg tracking-wider">
          {discountCode}
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          You can use it at checkout (paste into the “Discount Code” field).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave a review</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{transactionId}</div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Okay</option>
          <option value={2}>2 - Not great</option>
          <option value={1}>1 - Poor</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
          placeholder="Quick summary"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Review (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
          rows={5}
          placeholder="What worked well? Any tips for other travelers?"
        />
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
      >
        {loading ? "Submitting…" : "Submit review & get 5% off"}
      </button>
    </form>
  );
}

