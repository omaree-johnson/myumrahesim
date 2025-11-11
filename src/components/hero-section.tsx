"use client";

import { motion } from "framer-motion";
import { Novatrix } from "./novatrix-background";
import Link from "next/link";

export function HeroSection() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah Esim";
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
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
      <div className="relative z-10 px-4 py-10 md:py-20">
        <h1 className="mx-auto max-w-4xl text-center text-2xl font-bold text-slate-800 md:text-4xl lg:text-7xl drop-shadow-lg">
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
          className="mx-auto max-w-xl py-4 text-center text-lg font-normal text-gray-700 drop-shadow-md"
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
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link 
            href="/plans"
            className="w-60 transform rounded-lg bg-sky-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-700 shadow-xl hover:shadow-2xl text-center"
          >
            Get eSIM Now
          </Link>
          <button className="w-60 transform rounded-lg border-2 border-sky-600 bg-white/80 backdrop-blur-sm px-6 py-3 font-medium text-sky-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white shadow-lg hover:shadow-xl">
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
          className="mt-20 rounded-3xl border border-neutral-200 bg-white/60 backdrop-blur-md p-4 shadow-2xl max-w-2xl mx-auto"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm">
            <img 
              src="/kaaba-herop.jpg" 
              alt="Kaaba in Makkah - Stay connected with an eSIM during your Umrah journey"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
