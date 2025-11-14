import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function ComingSoonHero() {
  return (
  <section className="relative min-h-[60vh] flex flex-col items-center justify-center bg-linear-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-20 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full mb-6 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Coming Soon
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
          Exciting Features Are Coming Soon!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We're working hard to bring you new tools, guides, and resources to make your Umrah journey even smoother. Stay tuned for updates!
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
