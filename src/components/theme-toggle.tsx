"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === "dark" ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    );
  };

  const getLabel = () => {
    if (theme === "system") {
      return "System";
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
      aria-label={`Toggle theme. Current: ${getLabel()}`}
      title={`Theme: ${getLabel()}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {getIcon()}
    </button>
  );
}
