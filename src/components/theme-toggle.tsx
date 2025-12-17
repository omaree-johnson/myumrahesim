"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label="Theme toggle"
      title={`Theme: ${theme === "system" ? `System (${resolvedTheme})` : theme}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <Sun
        className={`h-3 w-3 transition-colors ${isDark ? "text-gray-400 dark:text-slate-500" : "text-sky-600 dark:text-sky-400"}`}
        aria-hidden="true"
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon
        className={`h-3 w-3 transition-colors ${isDark ? "text-sky-600 dark:text-sky-400" : "text-gray-400 dark:text-slate-500"}`}
        aria-hidden="true"
      />
    </div>
  );
}





