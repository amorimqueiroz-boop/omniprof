"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { effective, toggle } = useTheme();
  const isDark = effective === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Usar tema claro" : "Usar tema escuro"}
      className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all hover:opacity-90"
      style={{
        borderColor: "var(--border-light)",
        background: "var(--surface-2)",
        color: "var(--text-muted)",
      }}
      aria-label={isDark ? "Alternar para tema claro" : "Alternar para tema escuro"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
