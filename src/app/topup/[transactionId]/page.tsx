import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { getTopUpPackagesByIccid } from "@/lib/esimaccess";

export const dynamic = "force-dynamic";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "your purchase email";
  const maskedUser = user.length <= 2 ? `${user[0] || "*"}*` : `${user[0]}***${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
}

export default async function TopUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ transactionId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { transactionId } = await params;
  const sp = searchParams ? await searchParams : {};
  const discount = typeof sp?.discount === "string" ? sp.discount : Array.isArray(sp?.discount) ? sp.discount[0] : undefined;

  if (!isSupabaseAdminReady()) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Database is not configured.</p>
      </div>
    );
  }

  const { data: purchase } = await supabase
    .from("esim_purchases")
    .select(
      `
      transaction_id,
      customer_email,
      customer_name,
      activation_details (
        iccid,
        data_used,
        data_limit
      )
    `,
    )
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (!purchase) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Order not found.</p>
        <div className="mt-6">
          <Link className="text-sky-600 hover:text-sky-700 underline" href="/plans">
            Browse plans
          </Link>
        </div>
      </div>
    );
  }

  const purchaseEmail = (purchase as any).customer_email as string | null;
  const purchaseName = (purchase as any).customer_name as string | null;
  const iccid = (purchase as any).activation_details?.iccid as string | null;
  const usedBytes = (purchase as any).activation_details?.data_used as number | null;
  const totalBytes = (purchase as any).activation_details?.data_limit as number | null;

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null;

  // Not signed in: prompt to sign in/up with the purchase email
  if (!userId || !user) {
    const redirect = `/topup/${encodeURIComponent(transactionId)}${discount ? `?discount=${encodeURIComponent(discount)}` : ""}`;
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up your eSIM</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          To top up, please sign in (or create an account) using the email you purchased with{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {purchaseEmail ? maskEmail(purchaseEmail) : "your purchase email"}
          </span>
          .
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(redirect)}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
          >
            Create account to top up
          </Link>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(redirect)}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          Bought without an account? No worries — once you sign in with the same email, your order will appear automatically.
        </div>
      </div>
    );
  }

  // Signed in but email mismatch
  if (purchaseEmail && userEmail && purchaseEmail.toLowerCase() !== userEmail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up your eSIM</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          You’re signed in as <span className="font-semibold">{userEmail}</span>, but this order was purchased with{" "}
          <span className="font-semibold">{maskEmail(purchaseEmail)}</span>.
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Please sign in with the purchase email to top up this eSIM.
        </p>
        <div className="mt-6">
          <Link className="text-sky-600 hover:text-sky-700 underline" href="/sign-in">
            Switch account
          </Link>
        </div>
      </div>
    );
  }

  if (!iccid) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up your eSIM</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          This eSIM is still provisioning. Please check back once activation details are ready.
        </p>
        <div className="mt-6">
          <Link className="text-sky-600 hover:text-sky-700 underline" href={`/activation?transactionId=${encodeURIComponent(transactionId)}`}>
            View activation
          </Link>
        </div>
      </div>
    );
  }

  const topups = await getTopUpPackagesByIccid(iccid);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top up your eSIM</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {purchaseName ? `Hi ${purchaseName}, ` : ""}choose a top up to add more data to your existing eSIM.
        </p>
        {typeof usedBytes === "number" && typeof totalBytes === "number" && totalBytes > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Usage snapshot: {((usedBytes / totalBytes) * 100).toFixed(0)}% used.
          </p>
        )}
      </div>

      {topups.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8">
          <p className="text-gray-700 dark:text-gray-300">
            No top up options were returned for this eSIM yet.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            If you just installed the eSIM, wait a few minutes and refresh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topups.map((p) => {
            const priceLabel = `${p.price.currency} ${(p.price.fixed / 100).toFixed(2)}`;
            const name = p.name || `Top Up ${p.packageCode}`;
            return (
              <div key={p.packageCode} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
                <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono">{p.packageCode}</div>
                <div className="mt-4 text-2xl font-bold text-sky-600 dark:text-sky-400">{priceLabel}</div>
                <Link
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3"
                  href={`/checkout?topup=1&iccid=${encodeURIComponent(iccid)}&packageCode=${encodeURIComponent(p.packageCode)}&name=${encodeURIComponent(name)}&price=${encodeURIComponent(priceLabel)}${discount ? `&discount=${encodeURIComponent(discount)}` : ""}`}
                >
                  Top up now
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 text-sm text-gray-600 dark:text-gray-400">
        Want to review your orders?{" "}
        <Link className="text-sky-600 hover:text-sky-700 underline" href="/orders">
          Go to My Orders
        </Link>
      </div>
    </div>
  );
}

