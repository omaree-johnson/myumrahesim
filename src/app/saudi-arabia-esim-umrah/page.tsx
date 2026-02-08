import type { Metadata } from "next";
import Link from "next/link";
import { getLowestPrice } from "@/lib/pricing";
import {
  generateSeoLandingMetadata,
  type SeoLandingConfig,
} from "@/lib/seo-landing-config";
import { SeoLandingTemplate } from "@/components/seo-landing-template";

const CANONICAL_PATH = "saudi-arabia-esim-umrah";

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted ?? "£17.39";
  return generateSeoLandingMetadata({
    title: "Saudi Arabia eSIM for Umrah | Instant Mobile Data for Pilgrims",
    description: `Get a Saudi Arabia eSIM for Umrah. Instant activation, coverage in Makkah and Madinah, no airport queues. Plans from ${priceText}. QR code by email. Money-back guarantee.`,
    canonicalPath: CANONICAL_PATH,
    keywords: [
      "Saudi Arabia eSIM for Umrah",
      "eSIM Umrah",
      "eSIM Saudi Arabia",
      "Makkah eSIM",
      "Madinah eSIM",
      "Umrah mobile data",
      "eSIM for pilgrims",
      "Saudi Arabia eSIM plans",
    ],
  });
}

function buildConfig(priceText: string): SeoLandingConfig {
  return {
    h1: "Saudi Arabia eSIM for Umrah",
    breadcrumbLabel: "Saudi Arabia eSIM for Umrah",
    intro: (
      <>
        <p>
          A Saudi Arabia eSIM for Umrah gives you mobile data as soon as you land. No airport SIM queues, no physical SIM. Buy before you travel, receive a QR code by email, and activate on your phone in minutes. This page explains how it works and how to choose a plan.
        </p>
      </>
    ),
    sections: [
      {
        id: "why-esim-umrah",
        title: "Why use an eSIM for Umrah in Saudi Arabia?",
        content: (
          <>
            <p>
              eSIMs are digital SIMs built into most modern phones. For Umrah, that means you can order from home, get your QR code by email, and install the eSIM before you fly or as soon as you arrive. You avoid hunting for a SIM at the airport and can stay connected in Makkah, Madinah, and Jeddah from day one.
            </p>
            <p>
              Coverage is provided on local Saudi networks, with 4G and 5G where available. You keep your home SIM for calls and use the eSIM for data. Ideal for the Nusuk app, maps, and staying in touch with family.
            </p>
          </>
        ),
      },
      {
        id: "how-it-works",
        title: "How does a Saudi Arabia eSIM for Umrah work?",
        content: (
          <>
            <p>
              You choose a data plan (e.g. 7, 14 or 30 days), pay securely online, and receive a QR code by email within minutes. Scan the QR code on your phone to add the eSIM. You can do this at home before you travel or after you land. When you arrive in Saudi Arabia, turn on data for the eSIM and you’re connected. No physical SIM or airport kiosk needed.
            </p>
            <p>
              Plans are prepaid and start from {priceText}. You can <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">view eSIM plans here</Link> and compare data and validity to match your trip length.
            </p>
          </>
        ),
      },
      {
        id: "coverage",
        title: "Coverage in Makkah, Madinah and Saudi Arabia",
        content: (
          <>
            <p>
              Our Saudi Arabia eSIM uses local operator networks, with coverage across Makkah, Madinah, Jeddah, and other major cities. Speeds are 4G/5G where available, suitable for video calls, maps, and apps like Nusuk.
            </p>
            <p>
              If you’re travelling between cities (e.g. Jeddah–Makkah–Madinah), the same eSIM works across the country. No need to buy separate SIMs for each place.
            </p>
          </>
        ),
      },
      {
        id: "choose-plan",
        title: "Choosing the right eSIM plan for your Umrah trip",
        content: (
          <>
            <p>
              Match the plan length to your stay: 7-day plans for short Umrah trips, 14–30 days for longer visits or if you want a buffer. Data options range from a few GB to unlimited; for typical use (maps, messaging, Nusuk, some video), 10–20GB is often enough for a week or two.
            </p>
            <p>
              All plans are prepaid with no contracts. We send the QR code by email and can also send it via WhatsApp on request. If your eSIM doesn’t activate, we offer a money-back guarantee. <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">See plans and pricing</Link>.
            </p>
          </>
        ),
      },
    ],
    faq: [
      {
        question: "Can I use an eSIM for Umrah in Saudi Arabia?",
        answer:
          "Yes. eSIMs work in Saudi Arabia on supported networks. Most iPhones from XS onward and many Android phones (e.g. Samsung S20+, Google Pixel) support eSIM. You order online, receive a QR code by email, and activate on your device before or after you travel.",
      },
      {
        question: "When will I get my eSIM QR code for Saudi Arabia?",
        answer:
          "We send your eSIM QR code by email within minutes of payment. You can install it on your phone straight away or wait until you land. If you prefer, we can also send the QR code via WhatsApp. Just contact us after purchase with your order email.",
      },
      {
        question: "Does the eSIM work in Makkah and Madinah?",
        answer:
          "Yes. Our Saudi Arabia eSIM uses local operator coverage and works in Makkah, Madinah, Jeddah, and across the country. You use the same eSIM for your whole trip.",
      },
      {
        question: "Do I need to install the eSIM before I travel?",
        answer:
          "No. You can install the eSIM at home before you fly or after you arrive in Saudi Arabia. Installing before you travel means you only need to turn on data when you land. Either way, you avoid airport SIM queues.",
      },
      {
        question: "What if my eSIM doesn’t work?",
        answer:
          "We offer a money-back guarantee if your eSIM doesn’t activate. Our support team is available 24/7 via email and WhatsApp to help with setup and troubleshooting.",
      },
    ],
    internalLinks: [
      { label: "View eSIM plans", href: "/plans" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
    ],
  };
}

export default async function SaudiArabiaEsimUmrahPage() {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted ?? "£17.39";
  const config = buildConfig(priceText);
  return <SeoLandingTemplate config={config} />;
}
