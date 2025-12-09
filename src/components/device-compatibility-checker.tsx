"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Smartphone, Search } from "lucide-react";
import Link from "next/link";

// Common device compatibility data
const DEVICE_COMPATIBILITY: Record<string, { compatible: boolean; notes?: string }> = {
  // iPhone models (all iPhone XS and newer support eSIM)
  "iphone-xs": { compatible: true },
  "iphone-xs-max": { compatible: true },
  "iphone-xr": { compatible: true },
  "iphone-11": { compatible: true },
  "iphone-11-pro": { compatible: true },
  "iphone-11-pro-max": { compatible: true },
  "iphone-12": { compatible: true },
  "iphone-12-mini": { compatible: true },
  "iphone-12-pro": { compatible: true },
  "iphone-12-pro-max": { compatible: true },
  "iphone-13": { compatible: true },
  "iphone-13-mini": { compatible: true },
  "iphone-13-pro": { compatible: true },
  "iphone-13-pro-max": { compatible: true },
  "iphone-14": { compatible: true },
  "iphone-14-plus": { compatible: true },
  "iphone-14-pro": { compatible: true },
  "iphone-14-pro-max": { compatible: true },
  "iphone-15": { compatible: true },
  "iphone-15-plus": { compatible: true },
  "iphone-15-pro": { compatible: true },
  "iphone-15-pro-max": { compatible: true },
  "iphone-se-2020": { compatible: true },
  "iphone-se-2022": { compatible: true },
  "iphone-se-2024": { compatible: true },
  
  // Samsung Galaxy (S20 and newer, Note 20 and newer, Fold/Flip series)
  "samsung-galaxy-s20": { compatible: true },
  "samsung-galaxy-s21": { compatible: true },
  "samsung-galaxy-s22": { compatible: true },
  "samsung-galaxy-s23": { compatible: true },
  "samsung-galaxy-s24": { compatible: true },
  "samsung-galaxy-note-20": { compatible: true },
  "samsung-galaxy-z-fold": { compatible: true },
  "samsung-galaxy-z-flip": { compatible: true },
  "samsung-galaxy-pixel": { compatible: true },
  
  // Google Pixel (Pixel 2 and newer)
  "google-pixel-2": { compatible: true },
  "google-pixel-3": { compatible: true },
  "google-pixel-4": { compatible: true },
  "google-pixel-5": { compatible: true },
  "google-pixel-6": { compatible: true },
  "google-pixel-7": { compatible: true },
  "google-pixel-8": { compatible: true },
  
  // Other Android devices
  "oneplus-8": { compatible: true },
  "oneplus-9": { compatible: true },
  "oneplus-10": { compatible: true },
  "oneplus-11": { compatible: true },
  "motorola-razr": { compatible: true },
  
  // Older devices (not compatible)
  "iphone-x": { compatible: false, notes: "iPhone X and older models do not support eSIM" },
  "iphone-8": { compatible: false, notes: "iPhone 8 and older models do not support eSIM" },
  "samsung-galaxy-s10": { compatible: false, notes: "Galaxy S10 and older models do not support eSIM" },
};

const DEVICE_OPTIONS = [
  { value: "", label: "Select your device..." },
  { value: "iphone-15-pro-max", label: "iPhone 15 Pro Max" },
  { value: "iphone-15-pro", label: "iPhone 15 Pro" },
  { value: "iphone-15-plus", label: "iPhone 15 Plus" },
  { value: "iphone-15", label: "iPhone 15" },
  { value: "iphone-14-pro-max", label: "iPhone 14 Pro Max" },
  { value: "iphone-14-pro", label: "iPhone 14 Pro" },
  { value: "iphone-14-plus", label: "iPhone 14 Plus" },
  { value: "iphone-14", label: "iPhone 14" },
  { value: "iphone-13-pro-max", label: "iPhone 13 Pro Max" },
  { value: "iphone-13-pro", label: "iPhone 13 Pro" },
  { value: "iphone-13", label: "iPhone 13" },
  { value: "iphone-12-pro-max", label: "iPhone 12 Pro Max" },
  { value: "iphone-12-pro", label: "iPhone 12 Pro" },
  { value: "iphone-12", label: "iPhone 12" },
  { value: "iphone-11-pro-max", label: "iPhone 11 Pro Max" },
  { value: "iphone-11-pro", label: "iPhone 11 Pro" },
  { value: "iphone-11", label: "iPhone 11" },
  { value: "iphone-xs-max", label: "iPhone XS Max" },
  { value: "iphone-xs", label: "iPhone XS" },
  { value: "iphone-xr", label: "iPhone XR" },
  { value: "iphone-se-2024", label: "iPhone SE (2024)" },
  { value: "iphone-se-2022", label: "iPhone SE (2022)" },
  { value: "samsung-galaxy-s24", label: "Samsung Galaxy S24" },
  { value: "samsung-galaxy-s23", label: "Samsung Galaxy S23" },
  { value: "samsung-galaxy-s22", label: "Samsung Galaxy S22" },
  { value: "samsung-galaxy-s21", label: "Samsung Galaxy S21" },
  { value: "samsung-galaxy-s20", label: "Samsung Galaxy S20" },
  { value: "samsung-galaxy-z-fold", label: "Samsung Galaxy Z Fold" },
  { value: "samsung-galaxy-z-flip", label: "Samsung Galaxy Z Flip" },
  { value: "google-pixel-8", label: "Google Pixel 8" },
  { value: "google-pixel-7", label: "Google Pixel 7" },
  { value: "google-pixel-6", label: "Google Pixel 6" },
  { value: "google-pixel-5", label: "Google Pixel 5" },
  { value: "other-compatible", label: "Other compatible device" },
  { value: "not-sure", label: "Not sure / Check compatibility" },
];

export function DeviceCompatibilityChecker() {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (!selectedDevice) return;
    setShowResult(true);
    
    // Track compatibility check
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'Device_Compatibility_Checked', { device: selectedDevice });
    }
  };

  const compatibility = selectedDevice ? DEVICE_COMPATIBILITY[selectedDevice] : null;
  const isCompatible = compatibility?.compatible ?? null;

  return (
    <section className="bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full mb-4">
            <Smartphone className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Will eSIM Work on My Phone?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Check if your device supports eSIM before you buy. Most modern smartphones from 2018 onwards are compatible.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200 dark:border-slate-700">
          <div className="space-y-6">
            <div>
              <label htmlFor="device-select" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Select Your Device
              </label>
              <div className="flex gap-3">
                <select
                  id="device-select"
                  value={selectedDevice}
                  onChange={(e) => {
                    setSelectedDevice(e.target.value);
                    setShowResult(false);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white text-base"
                >
                  {DEVICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCheck}
                  disabled={!selectedDevice}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Check
                </button>
              </div>
            </div>

            {showResult && isCompatible !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 ${
                  isCompatible
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  {isCompatible ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      isCompatible
                        ? "text-emerald-900 dark:text-emerald-200"
                        : "text-red-900 dark:text-red-200"
                    }`}>
                      {isCompatible
                        ? "✅ Compatible – Your phone supports eSIM"
                        : "❌ Not Compatible"}
                    </h3>
                    {isCompatible ? (
                      <>
                        <p className="text-emerald-800 dark:text-emerald-300 mb-4">
                          Great news! Your device supports eSIM. You can purchase a plan and activate it by scanning the QR code we'll send to your email.
                        </p>
                        <Link
                          href="/plans"
                          className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Choose a Plan
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="text-red-800 dark:text-red-300 mb-2">
                          {compatibility?.notes || "Unfortunately, your device does not support eSIM technology."}
                        </p>
                        <p className="text-red-700 dark:text-red-400 text-sm">
                          You'll need a physical SIM card or a newer device that supports eSIM. Most iPhone XS and newer, and Samsung Galaxy S20 and newer support eSIM.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showResult && selectedDevice === "not-sure" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-start gap-4">
                  <Search className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                      How to Check Your Device
                    </h3>
                    <div className="space-y-3 text-amber-800 dark:text-amber-300">
                      <p className="font-semibold">For iPhone:</p>
                      <p className="text-sm">
                        Go to Settings → Cellular → Add Cellular Plan. If you see this option, your iPhone supports eSIM.
                        iPhone XS, XR, and all newer models support eSIM.
                      </p>
                      <p className="font-semibold mt-4">For Android:</p>
                      <p className="text-sm">
                        Go to Settings → Connections → SIM card manager → Add mobile plan. If you see this option, your device supports eSIM.
                        Most Samsung Galaxy S20 and newer, Google Pixel 2 and newer support eSIM.
                      </p>
                      <p className="mt-4 text-sm">
                        <strong>Still not sure?</strong>{" "}
                        <a
                          href={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER 
                            ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`
                            : `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`
                          }
                          className="underline font-medium"
                        >
                          Chat with us on WhatsApp
                        </a>{" "}
                        and we'll help you check.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

