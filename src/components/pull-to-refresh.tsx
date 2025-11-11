"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, threshold = 80 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    let touchStart = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh at the top of the page
      if (window.scrollY === 0) {
        touchStart = e.touches[0].clientY;
        setStartY(touchStart);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - startY;

      if (distance > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        // Apply resistance to the pull
        const resistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setIsPulling(false);
      setPullDistance(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullDistance, startY, threshold, onRefresh, isRefreshing]);

  const rotation = Math.min((pullDistance / threshold) * 360, 360);
  const opacity = Math.min(pullDistance / threshold, 1);

  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? "none" : "transform 0.3s ease",
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg"
        style={{
          opacity,
          transform: `scale(${Math.min(pullDistance / threshold, 1)})`,
        }}
      >
        <RefreshCw
          className={`w-6 h-6 text-sky-600 dark:text-sky-400 ${isRefreshing ? "animate-spin" : ""}`}
          style={{
            transform: isRefreshing ? "none" : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
}
