"use client";

import React, { createContext, useContext, useMemo } from "react";

export type SiteConfig = {
  brandName: string;
  baseUrl: string;
  supportEmail: string;
  whatsappNumber?: string | null;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: "My Umrah eSIM",
  baseUrl: "https://myumrahesim.com",
  supportEmail: "support@myumrahesim.com",
  whatsappNumber: null,
};

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  value,
  children,
}: {
  value: SiteConfig;
  children: React.ReactNode;
}) {
  const memoValue = useMemo(
    () => value,
    [value.brandName, value.baseUrl, value.supportEmail, value.whatsappNumber],
  );

  return (
    <SiteConfigContext.Provider value={memoValue}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  const ctx = useContext(SiteConfigContext);
  return ctx ?? DEFAULT_SITE_CONFIG;
}

