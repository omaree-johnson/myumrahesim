"use client";

import { Shield, Lock, Zap, CheckCircle, Users, Star } from "lucide-react";

export function TrustBadges() {
  return (
    <section className="bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 lg:py-16 border-y border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {/* Instant Activation Guarantee */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Instant Activation</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Guaranteed</p>
          </div>

          {/* Secure Payment */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Secure Payment</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Stripe Protected</p>
          </div>

          {/* Money-Back Guarantee */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Satisfaction</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Guaranteed</p>
          </div>

          {/* 10,000+ Customers */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">10,000+</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pilgrims Served</p>
          </div>

          {/* 4.8 Star Rating */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">4.8/5 Rating</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">150 Reviews</p>
          </div>

          {/* No Hidden Fees */}
          <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Hidden Fees</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Transparent Pricing</p>
          </div>
        </div>
      </div>
    </section>
  );
}


