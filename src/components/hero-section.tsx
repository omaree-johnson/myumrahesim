"use client";

import { motion } from "framer-motion";
import { Clock3, ShieldCheck, SignalHigh } from "lucide-react";
import { Novatrix } from "./novatrix-background";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM";
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-dvh w-full overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <Novatrix 
          color={[0.5, 0.8, 1.0]} 
          speed={0.5} 
          amplitude={0.15} 
          mouseReact={true} 
        />
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-white/40 backdrop-blur-sm" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20 lg:py-24 w-full max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-center">
          <span className="rounded-full bg-sky-100 text-sky-700 px-4 py-1 text-sm font-semibold shadow-sm">
            Trusted by pilgrims heading to Makkah & Madinah
          </span>
        </div>
        <h1 className="mx-auto max-w-5xl text-center text-3xl font-bold text-slate-800 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl drop-shadow-lg leading-tight lg:leading-tight xl:leading-tight" itemProp="headline">
          {"Stay Connected During Your Umrah Journey"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
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
          className="mx-auto max-w-3xl px-4 py-4 lg:py-6 text-center text-base sm:text-lg lg:text-xl font-normal text-gray-700 drop-shadow-md"
          itemProp="description"
        >
          Instant activation, no physical SIM required. Get high-speed mobile data with {brandName} and land in Saudi Arabia
          ready to navigate, message family, and order rides within minutes.
        </motion.p>
        
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
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-300"
        >
          <span className="font-semibold text-sky-600 dark:text-sky-400">10,000+</span>
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
          className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 lg:gap-5 w-full px-4 max-w-2xl mx-auto"
        >
          <Link
            href="/plans"
            className="w-full sm:w-auto lg:min-w-[200px] transform rounded-lg bg-sky-600 px-6 lg:px-8 py-4 lg:py-4 font-semibold text-white transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:bg-sky-700 shadow-xl hover:shadow-2xl text-center text-base lg:text-lg"
          >
            Get eSIM Now (from £17.39)
          </Link>
          <Link
            href="/learn-more"
            className="w-full sm:w-auto lg:min-w-[200px] transform rounded-lg border-2 border-sky-600 bg-white/80 backdrop-blur-sm px-6 lg:px-8 py-4 lg:py-4 font-semibold text-sky-600 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:bg-white shadow-lg hover:shadow-xl text-base lg:text-lg text-center"
          >
            Learn More
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.1 }}
          className="mt-2 text-center text-sm text-gray-600"
        >
          Instant QR delivery after checkout • Works with dual-SIM iPhones & Android
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.15 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mx-auto px-4"
        >
          {[{
            icon: <Clock3 className="w-5 h-5 text-sky-600" aria-hidden />, title: "Online in minutes", desc: "Checkout now and activate as soon as you land"
          }, {
            icon: <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden />, title: "Activation guarantee", desc: "Replacement or refund if your eSIM doesn’t connect"
          }, {
            icon: <SignalHigh className="w-5 h-5 text-indigo-600" aria-hidden />, title: "5G/4G coverage", desc: "Optimised for Makkah, Madinah, and Jeddah"
          }].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm p-4 shadow-sm flex items-start gap-3"
            >
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
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
            delay: 1.2,
          }}
          className="mt-12 sm:mt-16 md:mt-20 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white/60 backdrop-blur-md p-3 sm:p-4 shadow-2xl max-w-2xl mx-auto w-full"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm relative aspect-video">
            <Image 
              src="/kaaba-herop.jpg" 
              alt="Kaaba in Makkah - Stay connected with an eSIM during your Umrah journey in Saudi Arabia"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              quality={90}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
