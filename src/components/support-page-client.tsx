"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Phone,
  FileText,
  Search,
  MessageSquare,
  Zap,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "./site-config-provider";
import { Breadcrumbs } from "./breadcrumbs";

export function SupportPageClient() {
  const { supportEmail, whatsappNumber } = useSiteConfig();
  const [searchQuery, setSearchQuery] = useState("");

  // Format WhatsApp number for link (remove any non-digit characters except +)
  const formatWhatsAppNumber = (number: string | null | undefined): string | null => {
    if (!number) return null;
    // Remove all non-digit characters except +
    const cleaned = number.replace(/[^\d+]/g, '');
    // Ensure it starts with + or country code
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  const whatsappLink = whatsappNumber 
    ? `https://wa.me/${formatWhatsAppNumber(whatsappNumber)?.replace('+', '')}`
    : null;

  const supportTopics = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Activation Issues",
      description: "Having trouble activating your eSIM?",
      href: "/faq#activation",
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-900/20",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "QR Code Not Working",
      description: "Can't scan or activate your QR code?",
      href: "/blog/why-esim-not-working",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Device Compatibility",
      description: "Check if your device supports eSIM",
      href: "/blog/esim-device-compatibility",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "View All FAQs",
      description: "Browse our comprehensive FAQ section",
      href: "/faq",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  const quickLinks = [
    { label: "How to Activate eSIM", href: "/activation" },
    { label: "Troubleshooting Guide", href: "/blog/troubleshooting-esim" },
    { label: "Device Compatibility", href: "/blog/esim-device-compatibility" },
    { label: "View My Orders", href: "/orders" },
    { label: "Refund Policy", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 sm:py-12 lg:py-16">
        <Breadcrumbs 
          items={[
            { name: 'Home', url: '/' },
            { name: 'Support', url: '/support' },
          ]} 
          className="mb-6"
        />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How Can We Help You?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're here 24/7 to assist with your eSIM. Choose the best way to reach us.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/faq?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => window.location.href = `/faq?q=${encodeURIComponent(searchQuery)}`}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
            )}
          </div>
        </motion.div>

        {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl active:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Support
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <a
                  href={`mailto:${supportEmail}?subject=eSIM Support Request`}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-lg transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                  {supportEmail}
                </p>
              </div>
            </div>
          </motion.div>

          {/* WhatsApp Support */}
          {whatsappLink ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl active:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    WhatsApp Support
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                    Chat with us instantly on WhatsApp. Available 24/7.
                  </p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                    {whatsappNumber}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    WhatsApp Support
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    WhatsApp support coming soon. Please use email support for now.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Support Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Common Support Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {supportTopics.map((topic, index) => (
              <Link
                key={index}
                href={topic.href}
                className="group bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 active:border-sky-400 dark:active:border-sky-500 hover:shadow-lg active:shadow-md transition-all touch-manipulation"
              >
                <div className={`inline-flex p-3 ${topic.bgColor} rounded-lg mb-4`}>
                  <div className={topic.color}>
                    {topic.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {topic.description}
                </p>
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-sm font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 active:border-sky-400 dark:active:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 active:bg-sky-100 dark:active:bg-sky-900/30 transition-all group touch-manipulation min-h-[44px]"
              >
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Support Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 dark:text-sky-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">24/7 Support</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              We're available around the clock to help you
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">Fast Response</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Average response time under 2 hours
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">Expert Help</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Our team knows eSIMs inside and out
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
