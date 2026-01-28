import { SignIn } from "@clerk/nextjs";
import { headers } from "next/headers";
import { checkAuthRateLimit } from "@/lib/auth-security";

export default async function SignInPage() {
  // Rate limit check at page level to prevent brute force
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             headersList.get('x-real-ip')?.trim() || 
             'unknown';
  
  const rateLimit = await checkAuthRateLimit(`sign-in:${ip}`, 'sign-in');
  
  if (!rateLimit.allowed) {
    const secondsRemaining = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-16 sm:py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Too Many Attempts</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You've made too many sign-in attempts. Please try again after {secondsRemaining} seconds.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This helps protect your account from unauthorized access.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[85vh] flex items-start justify-center py-16 sm:py-20">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl dark:shadow-slate-900/60",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
