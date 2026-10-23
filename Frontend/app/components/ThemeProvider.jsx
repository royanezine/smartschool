
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useSyncExternalStore,
} from "react";


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

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }, []);

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
