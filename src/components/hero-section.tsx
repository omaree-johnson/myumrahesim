"use client";

import { motion } from "framer-motion";
import { Novatrix } from "./novatrix-background";
import Link from "next/link";

export function HeroSection() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah Esim";
  
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
        <h1 className="mx-auto max-w-5xl text-center text-3xl font-bold text-slate-800 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl drop-shadow-lg leading-tight lg:leading-tight xl:leading-tight">
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
          className="mx-auto max-w-2xl px-4 py-4 lg:py-6 text-center text-base sm:text-lg lg:text-xl font-normal text-gray-700 drop-shadow-md"
        >
          Instant activation, no physical SIM required. Get high-speed mobile data 
          for your travels in Saudi Arabia with our premium eSIM plans.
        </motion.p>
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
          className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 lg:gap-5 w-full px-4 max-w-lg lg:max-w-xl mx-auto"
        >
          <Link 
            href="/plans"
            className="w-full sm:w-auto lg:min-w-[200px] transform rounded-lg bg-sky-600 px-6 lg:px-8 py-4 lg:py-4 font-semibold text-white transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:bg-sky-700 shadow-xl hover:shadow-2xl text-center text-base lg:text-lg"
          >
            Get eSIM Now
          </Link>
          <button className="w-full sm:w-auto lg:min-w-[200px] transform rounded-lg border-2 border-sky-600 bg-white/80 backdrop-blur-sm px-6 lg:px-8 py-4 lg:py-4 font-semibold text-sky-600 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:bg-white shadow-lg hover:shadow-xl text-base lg:text-lg">
            Learn More
          </button>
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
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm">
            <img 
              src="/kaaba-herop.jpg" 
              alt="Kaaba in Makkah - Stay connected with an eSIM during your Umrah journey"
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
