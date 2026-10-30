import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/hooks/useI18n";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t.controls.switchToLight : t.controls.switchToDark}
      title={isDark ? t.controls.switchToLight : t.controls.switchToDark}
      className={`p-2 rounded-full text-cream/80 hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${className}`}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
