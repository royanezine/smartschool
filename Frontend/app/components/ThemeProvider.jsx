
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

// Layout effect agar kelas .dark dipulihkan SEBELUM paint pertama setelah
// hidrasi (mencegah flash light bila React menimpa className <html>).
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;


const STORAGE_KEY = "theme";

const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function getServerSnapshot() {
  return "light";
}

// Dijalankan saat HTML diparse (sebelum React hidrasi) agar kelas .dark
// sudah terpasang di <html> sejak paint pertama. Script hanya dirender
// di dalam area system, jadi area public tidak terpengaruh.
const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var tema =
      window.localStorage.getItem("theme") === "dark"
        ? "dark"
        : "light";
    var root = document.documentElement;

    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", tema);
    root.style.colorScheme = tema === "dark" ? "dark" : "light";
  } catch (error) {}
})();
`;

const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    document.body.classList.toggle("dark", theme === "dark");

    return () => {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
      root.style.removeProperty("color-scheme");
      document.body.classList.remove("dark");
    };
  }, [theme]);

  const setTheme = useCallback((next) => {
    const current = getSnapshot();
    const value = typeof next === "function" ? next(current) : next;
    const normalized = value === "dark" ? "dark" : "light";

    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
    }

    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
      />

      <div
        id="system-theme-root"
        className={`system-scope min-h-screen w-full ${
          theme === "dark" ? "dark" : ""
        }`}
        data-theme={theme}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
