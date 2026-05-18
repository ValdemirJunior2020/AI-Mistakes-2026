// components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-lg transition hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      aria-label="Toggle dark and light mode"
    >
      {isDark ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-slate-700" />}
      <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
