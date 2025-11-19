"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Check if service worker file exists before registering
      fetch("/sw.js", { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
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
                // Silently fail in production to avoid console noise
                if (process.env.NODE_ENV === "development") {
                  console.warn("Service Worker registration failed:", error);
                }
              });
          }
        })
        .catch(() => {
          // Service worker file doesn't exist, skip registration
          // This is normal in development or if PWA is disabled
        });
    }
  }, []);

  return null;
}
