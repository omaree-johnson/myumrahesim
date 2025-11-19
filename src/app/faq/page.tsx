import { FaqPageClient } from "@/components/faq-page-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions About eSIM for Saudi Arabia | Umrah eSIM",
  description: "Get answers to common questions about eSIM for Umrah and Hajj. Learn about activation, compatibility, data plans, pricing, and how to use eSIM in Saudi Arabia. Instant answers to help you stay connected during your pilgrimage.",
  keywords: [
    "eSIM FAQ",
    "eSIM questions",
    "eSIM Saudi Arabia FAQ",
    "Umrah eSIM questions",
    "Hajj eSIM help",
    "eSIM activation help",
    "eSIM compatibility",
    "eSIM troubleshooting",
    "Saudi Arabia eSIM guide"
  ],
  openGraph: {
    title: "FAQ - Frequently Asked Questions About eSIM for Saudi Arabia",
    description: "Find answers to common questions about our eSIM service for Saudi Arabia. Learn about activation, compatibility, data plans, and more.",
    type: "website",
    url: "/faq",
  },
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}
