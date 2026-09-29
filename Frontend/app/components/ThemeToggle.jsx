"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        flex h-10 w-10 items-center justify-center rounded-lg
        border border-slate-200
        bg-white text-slate-600
        hover:bg-slate-50
        dark:border-slate-700
        dark:bg-slate-800
        dark:text-slate-200
        dark:hover:bg-slate-700
      "
      title={isDark ? "Light Mode" : "Dark Mode"}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}