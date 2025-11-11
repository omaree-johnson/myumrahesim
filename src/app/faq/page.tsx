import { FaqPageClient } from "@/components/faq-page-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Umrah eSIM",
  description: "Find answers to common questions about our eSIM service for Saudi Arabia. Learn about activation, compatibility, data plans, and more.",
  openGraph: {
    title: "FAQ - Umrah eSIM",
    description: "Frequently asked questions about eSIM for Saudi Arabia",
    type: "website",
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}
