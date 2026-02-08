/**
 * Trust & Credibility section: testimonials (placeholders), trust signals,
 * and "Why pilgrims trust" bullets. Mobile-first, semantic HTML.
 * Server Component: no client JS shipped for this section (reduces TTI on mobile).
 * Replace testimonial placeholders with real content when available.
 */
import {
  Lock,
  QrCode,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
export function TrustCredibilitySection() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <h2
          id="trust-heading"
          className="text-center text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl"
        >
          Why pilgrims trust My Umrah eSIM
        </h2>

        {/* Trust signals: secure payments, instant QR, refund; mobile-first row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 sm:min-w-[140px] sm:flex-initial">
            <Lock className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Secure payments
            </span>
          </div>
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 sm:min-w-[140px] sm:flex-initial">
            <QrCode className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Instant QR delivery
            </span>
          </div>
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 sm:min-w-[140px] sm:flex-initial">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Refund policy
            </span>
          </div>
        </div>

        {/* Testimonial placeholders; replace with real content */}
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-5">
            <blockquote className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              [Testimonial quote placeholder. Replace with a short customer quote about their experience.]
            </blockquote>
            <footer className="mt-3 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              - [Name], [Trip context e.g. Umrah 2024]
            </footer>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-5">
            <blockquote className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              [Testimonial quote placeholder. Replace with a short customer quote.]
            </blockquote>
            <footer className="mt-3 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              - [Name], [Trip context e.g. Hajj 2024]
            </footer>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-5 sm:max-lg:col-span-2 lg:col-span-1">
            <blockquote className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              [Testimonial quote placeholder. Replace with a short customer quote.]
            </blockquote>
            <footer className="mt-3 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              - [Name], [Trip context]
            </footer>
          </article>
        </div>

        {/* Why pilgrims trust; bullet list */}
        <div className="mt-8 sm:mt-10">
          <h3 className="sr-only">Reasons pilgrims choose us</h3>
          <ul className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            <li className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-4">
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400"
                aria-hidden
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Activate before you fly. No airport SIM queues.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-4">
              <CreditCard
                className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400"
                aria-hidden
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Prepaid plans. No contracts or bill shock.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-4">
              <MessageSquare
                className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400"
                aria-hidden
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                UK-based support when you need it
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-4">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400"
                aria-hidden
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Money-back guarantee if it doesn’t work
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
