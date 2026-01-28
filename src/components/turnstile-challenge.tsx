"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useState, useEffect } from "react";

interface TurnstileChallengeProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  mode?: "managed" | "interactive";
  className?: string;
}

/**
 * Cloudflare Turnstile Challenge Component
 * 
 * Modes:
 * - managed: Automatic challenge (invisible for most users)
 * - interactive: Visible challenge (for suspicious users)
 */
export function TurnstileChallenge({
  siteKey,
  onSuccess,
  onError,
  mode = "managed",
  className = "",
}: TurnstileChallengeProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Force re-render on reset

  useEffect(() => {
    // Reset on mode change
    setToken(null);
    setError(null);
    setKey((k) => k + 1);
  }, [mode]);

  const handleSuccess = (token: string) => {
    setToken(token);
    setError(null);
    onSuccess(token);
  };

  const handleError = (error: string) => {
    setError(error);
    setToken(null);
    onError?.(error);
  };

  const handleExpire = () => {
    setToken(null);
    setKey((k) => k + 1); // Reset widget
  };

  return (
    <div className={`turnstile-wrapper ${className}`}>
      <Turnstile
        key={key}
        siteKey={siteKey}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme: "auto", // Follows system theme
          size: mode === "interactive" ? "normal" : "invisible",
          language: "auto",
        }}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          Challenge verification failed. Please try again.
        </p>
      )}
      {mode === "interactive" && !token && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Please complete the security challenge to continue.
        </p>
      )}
    </div>
  );
}

/**
 * Hook for using Turnstile challenge
 */
export function useTurnstile(siteKey: string) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setToken(null);
    setError(null);
    setLoading(false);
  };

  return {
    token,
    error,
    loading,
    setToken,
    setError,
    setLoading,
    reset,
  };
}
