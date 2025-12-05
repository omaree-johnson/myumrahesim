"use client";

import { useState } from "react";
import Footer from "./footer";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { StructuredData } from "./structured-data";
import { Breadcrumbs } from "./breadcrumbs";

interface FaqItem {
  question: string;
  answer: string;
}

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com";

const faqs: FaqItem[] = [
  {
    question: "What is the best eSIM for Umrah?",
    answer: `The best eSIM for Umrah is one that offers instant activation, reliable coverage in Makkah and Madinah, and affordable pricing. Our eSIM plans are specifically designed for Umrah and Hajj pilgrims, with coverage throughout Saudi Arabia, instant QR code delivery via email, and no physical SIM card required. Plans start from £17.39 and include high-speed 4G and 5G data.`
  },
  {
    question: "How do I get an eSIM for Umrah?",
    answer: `Getting an eSIM for Umrah is simple: visit our website, choose a data plan that suits your needs (ranging from 500MB per day to unlimited data), complete the purchase, and you'll receive a QR code via email instantly. Scan the QR code with your smartphone's camera or settings app, and your eSIM will be activated. The entire process takes just a few minutes and can be done before you travel to Saudi Arabia.`
  },
  {
    question: "Does eSIM work in Saudi Arabia for Umrah?",
    answer: `Yes, eSIM works perfectly in Saudi Arabia for Umrah and Hajj. Our eSIM plans provide coverage in Makkah, Madinah, Jeddah, Riyadh, and throughout Saudi Arabia. The eSIM connects to local Saudi networks, providing high-speed 4G and 5G data connectivity wherever you travel during your pilgrimage. You can use it for navigation, WhatsApp, video calls with family, and accessing important information during your spiritual journey.`
  },
  {
    question: "How much does an eSIM for Umrah cost?",
    answer: `eSIM plans for Umrah start from £17.39 and vary based on data allowance and validity period. We offer plans ranging from 500MB per day to unlimited data, with validity periods from 7 days to 30 days. All plans are prepaid with no hidden fees, no contracts, and no credit checks. You can choose the plan that best fits your needs and budget for your Umrah or Hajj journey.`
  },
  {
    question: "What is an eSIM?",
    answer: "An eSIM (embedded SIM) is a digital SIM card that allows you to activate a mobile data plan without needing a physical SIM card. It's built into your device and can be activated instantly through a QR code or app. For Umrah travelers, this means you can activate a Saudi Arabia mobile data plan without removing your home country SIM card, allowing you to keep your home number active while using data in Saudi Arabia."
  },
  {
    question: "How do I know if my phone supports eSIM?",
    answer: "Most modern smartphones support eSIM, including iPhone XS and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, and many other devices. Check your phone's settings under 'Mobile Data' or 'Cellular' to see if you have an option to add an eSIM or data plan."
  },
  {
    question: "How quickly will I receive my eSIM?",
    answer: "Your eSIM QR code will be delivered instantly to your email after purchase. You can activate it immediately or wait until you arrive in Saudi Arabia. The activation process takes just a few minutes."
  },
  {
    question: "When should I activate my eSIM?",
    answer: "You can install the eSIM profile on your device before traveling, but we recommend activating it only when you arrive in Saudi Arabia and are ready to use data. The validity period starts from the moment of first activation."
  },
  {
    question: "Can I use my eSIM for calls and SMS?",
    answer: "Our eSIM plans are data-only and do not support traditional voice calls or SMS. However, you can use internet-based services like WhatsApp, FaceTime, Skype, or other VoIP apps for communication."
  },
  {
    question: "Will my existing SIM card still work with an eSIM?",
    answer: "Yes! Your device can use both your physical SIM card and eSIM simultaneously. You can keep your home number active for calls and texts while using the eSIM for mobile data in Saudi Arabia."
  },
  {
    question: "What happens if I run out of data?",
    answer: "If you exhaust your data allowance before the validity period ends, you can purchase a new eSIM plan. Some plans may offer throttled speeds after the limit, while others will stop working. Check your specific plan details."
  },
  {
    question: "Can I top up or extend my eSIM plan?",
    answer: "Currently, our eSIM plans cannot be topped up. If you need more data, you can purchase an additional eSIM plan. Make sure to check how much data you've used through your device settings."
  },
  {
    question: "What network will I be using in Saudi Arabia?",
    answer: "Our eSIMs connect to major local networks in Saudi Arabia, providing reliable 4G/5G coverage throughout the country, including Makkah, Madinah, Jeddah, and Riyadh."
  },
  {
    question: "Do I need to remove my eSIM after my trip?",
    answer: "No, you don't need to remove the eSIM profile. Once the validity period expires or data is used up, the eSIM will simply stop working. You can leave it on your device or delete it from your settings if you prefer."
  },
  {
    question: "Can I share my eSIM with another device?",
    answer: "No, each eSIM is designed for use on a single device only. If you need data for multiple devices, you'll need to purchase separate eSIM plans or use your device's personal hotspot feature to share data."
  },
  {
    question: "What should I do if my eSIM isn't working?",
    answer: `First, ensure data roaming is enabled in your device settings and that you've selected the correct eSIM for mobile data. Try restarting your device. If issues persist, check that you're within the validity period and haven't exceeded your data limit. Contact our support team at ${supportEmail} for assistance.`
  },
  {
    question: "Is the connection secure?",
    answer: "Yes, eSIM connections use the same security standards as traditional SIM cards. Always use HTTPS websites and consider a VPN for additional security when accessing sensitive information."
  },
  {
    question: "Can I get a refund if I don't use my eSIM?",
    answer: `Refund policies vary. Generally, once an eSIM QR code has been delivered, it cannot be refunded as it has been issued for your use. Please review our terms and conditions or contact support at ${supportEmail} for specific refund requests.`
  }
];

export function FaqPageClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Prepare FAQ structured data
  const faqStructuredData = {
    questions: faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  };

  return (
    <>
      <StructuredData type="faq" data={faqStructuredData} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
        <Breadcrumbs 
          items={[{ name: 'FAQ', url: '/faq' }]} 
          className="mb-6"
        />
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h1>
            <Link
              href="/"
              className="px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border-2 border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors text-center sm:text-left whitespace-nowrap"
            >
              ← Back to Home
            </Link>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
            Find answers to common questions about our eSIM service for Saudi Arabia.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                id={`faq-answer-${index}`}
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 p-6 sm:p-8 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/plans"
              className="inline-block px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base text-center"
            >
              View Our Plans
            </Link>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`}
              className="inline-block px-6 py-3 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-slate-600 transition-colors text-sm sm:text-base text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <Footer />
      </div>
    </>
  );
}
