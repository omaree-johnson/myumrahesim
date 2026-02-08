import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import type {
  SeoLandingConfig,
  SeoLandingSection,
  SeoLandingFaqItem,
  SeoLandingInternalLink,
} from "@/lib/seo-landing-config";
import { seoConfig } from "@/lib/seoConfig";

const DEFAULT_LINKS: SeoLandingInternalLink[] = [
  { label: "View eSIM plans", href: "/plans" },
  { label: "FAQ", href: "/faq" },
];

/**
 * Reusable SEO landing page template.
 * - Clear H1 → H2 structure, semantic HTML
 * - FAQ section with schema.org FAQPage structured data
 * - Internal links to product/FAQ
 * - Lightweight, server-rendered, no heavy client JS
 */
export function SeoLandingTemplate({ config }: { config: SeoLandingConfig }) {
  const {
    h1,
    intro,
    sections,
    faq,
    breadcrumbLabel,
    internalLinks = DEFAULT_LINKS,
  } = config;

  const baseUrl = seoConfig.baseUrl;
  const faqSchemaQuestions = faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <>
      <StructuredData
        type="faq"
        data={{ questions: faqSchemaQuestions }}
      />
      <article className="min-h-screen bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-slate-600 dark:text-slate-400"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-slate-900 dark:text-white">
              {breadcrumbLabel}
            </span>
          </nav>

          {/* H1 + intro */}
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              {h1}
            </h1>
            <div className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
              {intro}
            </div>
          </header>

          {/* Sections: H2 + content */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6"
                aria-labelledby={`section-${section.id}`}
              >
                <h2
                  id={`section-${section.id}`}
                  className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4"
                >
                  {section.title}
                </h2>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed prose prose-slate dark:prose-invert max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:my-3 [&>ul]:pl-5 [&>li]:mb-1">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* FAQ */}
          {faq.length > 0 && (
            <section
              id="faq"
              className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-700"
              aria-labelledby="faq-heading"
            >
              <h2
                id="faq-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6"
              >
                Frequently asked questions
              </h2>
              <ul className="space-y-4" role="list">
                {faq.map((item, index) => (
                  <li key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                      {item.question}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Internal links CTA */}
          <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Next steps
            </p>
            <ul className="flex flex-wrap gap-3" role="list">
              {internalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </article>
    </>
  );
}
