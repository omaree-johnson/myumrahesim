"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Try to register service worker
      // It will fail gracefully if sw.js doesn't exist (e.g., in development)
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          // Silently fail - this is normal if:
          // - Service worker file doesn't exist (development)
          // - PWA is disabled
          // - User is on HTTP instead of HTTPS
          // Only log in development for debugging
          if (process.env.NODE_ENV === "development") {
            console.warn("Service Worker registration failed (this is normal in dev):", error.message);
          }
        });
    }
  }, []);

  return null;
}
