"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Mail, Smartphone } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  return (
    <section className="bg-white dark:bg-slate-900 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get your eSIM ready in three simple steps – no store visits, no waiting in line
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              step: 1,
              icon: <ShoppingCart className="w-8 h-8 text-sky-600" />,
              title: "Choose your data plan",
              description: "Select the perfect eSIM plan for your Umrah or Hajj journey. Choose based on your data needs and travel duration (7-30 days).",
              detail: "Best for 7–10 day Umrah trips",
            },
            {
              step: 2,
              icon: <Mail className="w-8 h-8 text-emerald-600" />,
              title: "Receive QR code instantly",
              description: "Complete your purchase and receive your QR code via email within minutes. No waiting, no delays – it's ready when you are.",
              detail: "Check your email immediately after checkout",
            },
            {
              step: 3,
              icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
              title: "Scan QR on arrival and connect",
              description: "When you arrive in Saudi Arabia, scan the QR code with your phone. Your eSIM activates automatically – keep your original SIM for calls and WhatsApp.",
              detail: "Works with dual-SIM iPhones & Android",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                {item.step}
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-md">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                    {item.detail}
                  </p>
                </div>
              </div>

              {/* Connector Line (hidden on mobile, shown between steps on desktop) */}
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 w-12 lg:w-24 h-0.5 bg-gradient-to-r from-sky-200 to-sky-400 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-sky-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/plans"
            className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-lg transition-all hover:-translate-y-0.5"
          >
            Choose Your Plan Now
          </Link>
        </div>
      </div>
    </section>
  );
}

