import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Змінити тему"
      className="relative w-10 h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-colors duration-200 flex items-center justify-center text-foreground"
      data-testid="theme-toggle"
    >
      {theme === "dark" ? (
        <Sun size={18} strokeWidth={2.2} />
      ) : (
        <Moon size={18} strokeWidth={2.2} />
      )}
    </button>
  );
}
