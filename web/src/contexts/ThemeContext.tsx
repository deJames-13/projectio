"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "projectio-theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setThemeState(saved);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Compute resolved theme & apply .dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const computeResolved = (): "light" | "dark" => {
      if (theme === "dark") return "dark";
      if (theme === "light") return "light";
      return mediaQuery.matches ? "dark" : "light";
    };

    const applyTheme = () => {
      const res = computeResolved();
      setResolvedTheme(res);

      if (res === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }

      // Update favicon dynamically based on theme
      const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (favicon) {
        favicon.href = res === "dark" ? "/dark-favicon-32x32.png" : "/favicon-32x32.png";
      }
    };

    applyTheme();

    // Listen to system color-scheme changes if set to system
    const listener = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage errors
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
