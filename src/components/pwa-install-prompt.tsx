"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isStandalonePWA = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandalonePWA);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt again after 7 days
    if (daysSinceDismissed > 7 || !dismissed) {
      // Listen for beforeinstallprompt event (Android/Desktop)
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handler);

      // For iOS, show custom instructions after a delay
      if (iOS && !isStandalonePWA) {
        setTimeout(() => setShowPrompt(true), 5000);
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
    }

    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  // Don't show if already installed or not ready
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="bg-white border-t-2 border-sky-500 shadow-2xl rounded-t-3xl p-6 animate-slide-up">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-sky-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                Install {process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah Esim"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isIOS
                  ? "Add to your Home Screen for a better experience"
                  : "Install our app for quick access and offline use"}
              </p>

              {isIOS ? (
                // iOS Instructions
                <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 mb-4">
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>
                      Tap the <span className="font-semibold">Share</span> button{" "}
                      <svg
                        className="inline w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z" />
                      </svg>
                    </li>
                    <li>
                      Scroll down and tap{" "}
                      <span className="font-semibold">"Add to Home Screen"</span>
                    </li>
                    <li>
                      Tap <span className="font-semibold">"Add"</span> to confirm
                    </li>
                  </ol>
                </div>
              ) : (
                // Android/Desktop Install Button
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </button>
              )}

              {isIOS && (
                <button
                  onClick={handleDismiss}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2"
                >
                  Maybe Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="hidden sm:block fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
        <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-4 mx-4 animate-slide-down">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-sky-600" />
            </div>

            <div className="flex-1 pr-6">
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                Install {process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah Esim"}
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Get faster access and work offline
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium py-2 px-4"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
