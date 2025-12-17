"use client";

import { Shield, Lock, Zap, CheckCircle, Users, Star, QrCode, MessageCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function TrustBadges() {
  return (
    <section className="bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 lg:py-16 border-y border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Primary Trust Row - Prominent */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-sky-200 dark:border-sky-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold text-green-700 dark:text-green-400"
            >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>Instant QR</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>Money-Back Guarantee</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>UK-Based Support</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold text-sky-700 dark:text-sky-400"
            >
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>Works in Makkah</span>
            </motion.div>
          </div>
        </div>

        {/* Secondary Trust Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {/* Instant Activation Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Instant Activation</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Guaranteed</p>
          </motion.div>

          {/* Secure Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Secure Payment</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Stripe Protected</p>
          </motion.div>

          {/* Money-Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Satisfaction</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Guaranteed</p>
          </motion.div>

          {/* 10,000+ Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">10,000+</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pilgrims Served</p>
          </motion.div>

          {/* 4.8 Star Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">4.8/5 Rating</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">150 Reviews</p>
          </motion.div>

          {/* No Hidden Fees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Hidden Fees</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Transparent Pricing</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}







