import { CheckCircle2, Headset, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function ConversionBoost({ lowestPrice = "£17.39" }: { lowestPrice?: string }) {
  return (
    <section className="bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-16 lg:py-24 border-y border-gray-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-slate-700">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span>Trusted by Umrah pilgrims worldwide</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Get your Umrah eSIM set up before you fly
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-xl">
              Finish checkout in minutes, receive your QR instantly, and arrive in Saudi Arabia ready to go online. We highlight the best-selling plan so you can choose confidently and avoid decision fatigue.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{
              title: "Instant QR delivery",
              description: "Order now and receive your activation email within minutes.",
            }, {
              title: "Risk-free activation",
              description: "If your eSIM doesn’t connect, we’ll replace it or refund you.",
            }, {
              title: "Plan pick guidance",
              description: "Clear recommendation for the most chosen Umrah option.",
            }, {
              title: "Real human support",
              description: "Need help? Get quick assistance before and after purchase.",
            }].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-4">
            <Link
              href="/plans"
              className="inline-flex justify-center items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 shadow-lg transition-transform active:scale-95"
            >
              View best plan and checkout
            </Link>
            <Link
              href="/faq"
              className="inline-flex justify-center items-center gap-2 rounded-lg border-2 border-sky-600 text-sky-700 dark:text-sky-300 bg-white/80 dark:bg-transparent px-6 py-3 font-semibold hover:-translate-y-0.5 transition-transform"
            >
              Questions? Read FAQs
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
              <span>Full activation guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
              <Headset className="h-5 w-5 text-sky-600" aria-hidden />
              <span>UK-based support before you travel</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-100 via-white to-emerald-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 blur-3xl opacity-70" aria-hidden />
          <div className="relative rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">Most chosen by pilgrims</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Starts from</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{lowestPrice}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Prepaid data eSIM • ready before you arrive</p>
            </div>
            <div className="space-y-3">
              {["Instant QR email after checkout", "Covers Makkah, Madinah & Jeddah", "Keep your primary SIM for calls"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-sky-600" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 p-4 text-sm text-gray-800 dark:text-gray-200">
              Checkout now and we’ll hold your QR until you travel. You can switch plans for free before activation.
            </div>
            <Link
              href="/plans"
              className="block w-full text-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-3 shadow-lg transition-transform active:scale-95"
            >
              Buy this plan in 2 minutes
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Secure checkout with Stripe • No hidden fees</p>
          </div>
        </div>
      </div>
    </section>
  );
}
