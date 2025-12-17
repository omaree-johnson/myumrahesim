import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const { userId } = await auth();

  if (!userId) {
    const redirect = `/review/${encodeURIComponent(transactionId)}`;
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave a review</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Please sign in to leave a review and receive your discount code.
        </p>
        <div className="mt-6">
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(redirect)}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review your order</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Submit a quick review and we’ll email you a <span className="font-semibold">5% off</span> code.
        </p>
      </div>
      <ReviewForm transactionId={transactionId} />
      <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        Back to{" "}
        <Link className="text-sky-600 hover:text-sky-700 underline" href="/orders">
          My Orders
        </Link>
      </div>
    </div>
  );
}

