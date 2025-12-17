"use client";

import { motion } from "framer-motion";
import { Clock3, ShieldCheck, SignalHigh, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection({ lowestPrice = "£17.39" }: { lowestPrice?: string }) {
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-dvh w-full overflow-hidden">
      {/* Kaaba Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/kaaba-herop.jpg" 
          alt="Kaaba in Makkah - Stay connected during your Umrah journey"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
        />
        {/* Gradient overlay for better text readability - stronger on top, lighter on bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/60 to-slate-900/50" />
        {/* Additional subtle overlay for text contrast */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-20 lg:py-24 w-full max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-sky-700 dark:text-sky-400 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-lg border border-sky-200/50 dark:border-sky-700/50"
          >
            Trusted by pilgrims heading to Makkah & Madinah
          </motion.span>
        </div>
        <h1 className="mx-auto max-w-5xl text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl drop-shadow-2xl leading-tight lg:leading-tight xl:leading-tight" itemProp="headline">
          {"Stay Connected to Your Loved Ones During Umrah – From the Moment You Land in Makkah"
            .split(" ")
            .map((word, index) => {
              const isHighlighted = word.toLowerCase().includes("umrah") || 
                                   word.toLowerCase() === "makkah" || 
                                   word.toLowerCase() === "connected" ||
                                   word.toLowerCase() === "loved";
              return (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeInOut",
                  }}
                  className={`mr-2 inline-block ${isHighlighted ? 'text-sky-300 dark:text-sky-300 drop-shadow-lg' : 'text-white'}`}
                >
                  {word}
                </motion.span>
              );
            })}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="mx-auto max-w-3xl px-4 py-4 lg:py-6 text-center text-base sm:text-lg lg:text-xl font-normal text-white/95 drop-shadow-lg"
          itemProp="description"
        >
          Instant eSIM activation, {lowestPrice}, works in Makkah & Madinah, 24/7 WhatsApp support. Join 10,000+ pilgrims—skip airport queues, save 70% vs. roaming.
        </motion.p>
        
        {/* Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90"
        >
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">24/7 WhatsApp Support</span>
          </div>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Money-Back Guarantee</span>
          </div>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Clock3 className="w-4 h-4 text-sky-600" />
            <span className="font-medium">Instant QR Delivery</span>
          </div>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">Works in Makkah, Madinah & Jeddah</span>
          </div>
        </motion.div>
        
        {/* Customer Count - Social Proof */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 0.9,
          }}
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm sm:text-base text-white/90"
        >
          <span className="font-semibold text-sky-300">10,000+</span>
          <span>pilgrims served</span>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★★★★★</span>
            <span className="font-semibold">4.8/5</span>
          </div>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="mt-6 sm:mt-8 lg:mt-10 flex items-center justify-center w-full px-4"
        >
          <Link
            href="/plans"
            onClick={() => {
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead');
              }
            }}
            className="w-full sm:w-auto lg:min-w-[320px] transform rounded-lg bg-sky-600 hover:bg-sky-700 active:bg-sky-800 px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 font-semibold text-white transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-2xl hover:shadow-sky-500/50 text-center text-base sm:text-lg ring-2 ring-white/20 hover:ring-white/40 touch-manipulation min-h-[48px]"
          >
            Get Your eSIM in 60 Seconds
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.1 }}
          className="mt-2 text-center text-sm text-white/80"
        >
          Instant QR delivery after checkout • Works with dual-SIM iPhones & Android
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.15 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl mx-auto px-4"
        >
          {[{
            icon: <Clock3 className="w-5 h-5 text-sky-600" aria-hidden />, title: "Online in minutes", desc: "Checkout now and activate as soon as you land", highlightTitle: true
          }, {
            icon: <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden />, title: "Activation guarantee", desc: "Replacement or refund if your eSIM doesn’t connect"
          }, {
            icon: <SignalHigh className="w-5 h-5 text-indigo-600" aria-hidden />, title: "5G/4G coverage", desc: "Optimised for Makkah, Madinah, and Jeddah"
          }].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.2 + (index * 0.1) }}
              className="rounded-xl border border-white/20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 sm:p-4 shadow-xl flex items-start gap-2 sm:gap-3"
            >
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.highlightTitle ? (
                    <>
                      Online in <span className="text-sky-600 dark:text-sky-400">minutes</span>
                    </>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
