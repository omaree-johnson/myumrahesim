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
  },
  {
    question: "How do I activate eSIM on iPhone for Umrah?",
    answer: "To activate eSIM on iPhone: Go to Settings → Cellular → Add Cellular Plan. Then scan the QR code we sent to your email, or enter the activation code manually. Make sure you're connected to Wi-Fi during activation. Once installed, enable the eSIM for data and turn on data roaming."
  },
  {
    question: "How do I activate eSIM on Android for Umrah?",
    answer: "To activate eSIM on Android: Go to Settings → Connections → SIM card manager → Add mobile plan. Scan the QR code from your email or enter the activation code. After installation, select the eSIM for mobile data and enable data roaming in your network settings."
  },
  {
    question: "What is the difference between eSIM and physical SIM for Saudi Arabia?",
    answer: "eSIM is digital and activates instantly via QR code, while physical SIM requires visiting a store in Saudi Arabia. eSIM allows you to keep your home SIM active for calls while using data, whereas physical SIM typically requires removing your home SIM. eSIM is more convenient for travelers and activates before you arrive."
  },
  {
    question: "Can I use eSIM for Hajj as well as Umrah?",
    answer: "Yes! Our eSIM plans work for both Umrah and Hajj. They provide coverage throughout Saudi Arabia, including Makkah, Madinah, Mina, Arafat, and Muzdalifah. The same eSIM can be used for both pilgrimages if your validity period covers both trips."
  },
  {
    question: "How much data do I need for a 7-day Umrah trip?",
    answer: "For a 7-day Umrah trip, most pilgrims use 1-2GB per day for navigation, WhatsApp, and basic browsing. We recommend a 5GB to 10GB plan for comfortable usage. If you plan to make video calls or stream content, consider a larger plan or unlimited option."
  },
  {
    question: "Does eSIM work in Jeddah airport?",
    answer: "Yes, our eSIM plans work immediately upon arrival at Jeddah airport and throughout Saudi Arabia. Once you scan the QR code and enable data roaming, you'll have connectivity as soon as you land. This is perfect for ordering rides, contacting family, and navigating from the airport."
  },
  {
    question: "Can I use hotspot/tethering with my eSIM?",
    answer: "Yes, most of our eSIM plans support personal hotspot and tethering, allowing you to share your data connection with other devices like tablets or laptops. Check your specific plan details for hotspot limitations, as some plans may have restrictions on hotspot usage."
  },
  {
    question: "What happens if I lose my phone with the eSIM?",
    answer: "If you lose your phone, contact our support team immediately. We can help deactivate the eSIM and, depending on your plan, may be able to issue a replacement. However, data already used cannot be recovered. We recommend keeping a backup of your QR code in a secure location."
  },
  {
    question: "Do I need to unlock my phone to use eSIM?",
    answer: "No, eSIM doesn't require phone unlocking. However, your phone must support eSIM technology (iPhone XS and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, etc.). If your phone is carrier-locked, you may still be able to use eSIM, but check with your carrier first."
  },
  {
    question: "How do I check my eSIM data usage?",
    answer: "You can check your data usage in your phone's settings: iPhone: Settings → Cellular → select your eSIM plan. Android: Settings → Connections → Data usage → select your eSIM. This shows how much data you've used and how much remains in your plan."
  },
  {
    question: "Can I use eSIM for business travel to Saudi Arabia?",
    answer: "Absolutely! Our eSIM plans are perfect for business travelers to Saudi Arabia. They provide reliable connectivity in Riyadh, Jeddah, Dammam, and all major business centers. You can use it for video calls, email, and accessing business applications throughout your trip."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment system. We also support Apple Pay and Google Pay for faster checkout. All payments are processed securely and encrypted."
  },
  {
    question: "How long does eSIM activation take?",
    answer: "eSIM activation is instant! Once you scan the QR code or enter the activation code, your eSIM profile is installed on your device within seconds. The entire process from purchase to activation takes less than 5 minutes. You'll receive your QR code via email immediately after purchase."
  },
  {
    question: "Can I use eSIM in multiple countries or just Saudi Arabia?",
    answer: "Our eSIM plans are specifically designed for Saudi Arabia and provide coverage throughout the country. If you're traveling to other GCC countries, some plans may include regional coverage. Check your specific plan details for coverage areas before purchasing."
  },
  {
    question: "What if my eSIM doesn't activate on arrival?",
    answer: "If your eSIM doesn't activate, first check that data roaming is enabled and you've selected the eSIM for mobile data. Try restarting your phone. If issues persist, contact our 24/7 support team immediately. We offer a money-back guarantee if the eSIM fails to activate or connect."
  },
  {
    question: "Do you offer customer support in Arabic?",
    answer: "Yes, we provide customer support in both English and Arabic. Our support team is available 24/7 via email and WhatsApp to assist you with any questions or issues related to your eSIM for Umrah or Hajj journey."
  },
  {
    question: "Can I purchase eSIM for my family members?",
    answer: "Yes, you can purchase eSIM plans for multiple family members. Each person will need their own eSIM plan and compatible device. Simply complete separate purchases for each family member, and each will receive their own QR code via email."
  },
  {
    question: "What network speeds can I expect with eSIM in Saudi Arabia?",
    answer: "Our eSIM plans provide high-speed 4G and 5G connectivity in Saudi Arabia, depending on network availability in your location. In major cities like Makkah, Madinah, and Jeddah, you can expect fast speeds suitable for video calls, streaming, and all data-intensive activities."
  },
  {
    question: "Is there a limit on how many eSIM plans I can purchase?",
    answer: "There's no limit on the number of eSIM plans you can purchase. However, each device can typically only have one active eSIM profile at a time (in addition to a physical SIM). If you need multiple plans, you can purchase them and activate them sequentially as needed."
  },
  {
    question: "Can I use eSIM during peak Umrah season?",
    answer: "Yes, our eSIM plans work year-round, including during peak Umrah and Hajj seasons. Network coverage may be more congested during peak times in Makkah and Madinah, but you'll still have reliable connectivity. We recommend purchasing your plan in advance during peak seasons."
  },
  {
    question: "What makes your eSIM better than roaming?",
    answer: "Our eSIM is significantly cheaper than international roaming (often 70-90% savings), provides faster activation (instant vs. waiting for carrier setup), allows you to keep your home SIM active, and offers transparent pricing with no surprise charges. You also get local Saudi network speeds and coverage."
  },
  {
    question: "Do you offer eSIM plans for longer stays (30+ days)?",
    answer: "Yes, we offer eSIM plans with validity periods ranging from 7 days to 30 days. For longer stays, you can purchase multiple plans or choose our 30-day plans with larger data allowances. Contact our support team if you need a custom solution for extended stays."
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
