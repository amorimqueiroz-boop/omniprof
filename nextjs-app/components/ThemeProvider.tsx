"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "omniprof_theme";

type Theme = "light" | "dark" | "system";

function getStored(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {}
  return "system";
}

function resolveEffective(theme: Theme): "light" | "dark" {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  effective: "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system",
      setTheme: () => {},
      effective: "light",
      toggle: () => {},
    };
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [effective, setEffective] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = resolveEffective(prev) === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    setThemeState(getStored());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const eff = resolveEffective(theme);
    setEffective(eff);
    document.documentElement.setAttribute("data-theme", eff);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const eff = resolveEffective("system");
        setEffective(eff);
        document.documentElement.setAttribute("data-theme", eff);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    effective,
    toggle,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
