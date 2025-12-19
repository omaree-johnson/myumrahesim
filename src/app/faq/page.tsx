import { FaqPageClient } from "@/components/faq-page-client";
import type { Metadata } from 'next';
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { seoConfig, getCanonicalUrl } from "@/lib/seoConfig";

export const metadata: Metadata = {
  title: "eSIM for Umrah FAQ | Common Questions Answered",
  description: "Get answers to common questions about eSIM for Umrah and Hajj. Learn about activation, compatibility, coverage, and pricing. Stay connected in Saudi Arabia.",
  keywords: [
    "eSIM FAQ",
    "eSIM questions",
    "eSIM Saudi Arabia FAQ",
    "Umrah eSIM questions",
    "Hajj eSIM help",
    "eSIM activation help",
    "eSIM compatibility",
    "eSIM troubleshooting",
    "Saudi Arabia eSIM guide",
    "eSIM for Umrah FAQ",
    "eSIM for Hajj FAQ",
    "how to activate eSIM",
    "eSIM not working",
    "eSIM support",
  ],
  openGraph: {
    title: "FAQ - Frequently Asked Questions About eSIM for Saudi Arabia",
    description: "Find answers to common questions about our eSIM service for Saudi Arabia. Learn about activation, compatibility, data plans, and more.",
    type: "website",
    url: getCanonicalUrl("/faq"),
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'FAQ - eSIM for Umrah and Hajj',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Frequently Asked Questions About eSIM for Saudi Arabia",
    description: "Get answers to common questions about eSIM for Umrah and Hajj. Learn about activation, compatibility, and data plans.",
    images: [seoConfig.defaultOgImage],
  },
  alternates: {
    canonical: getCanonicalUrl("/faq"),
  },
};

export default function FaqPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs items={[
          { name: 'FAQ', url: '/faq' },
        ]} className="mb-6" />
      </div>
      <FaqPageClient />
    </>
  );
}
