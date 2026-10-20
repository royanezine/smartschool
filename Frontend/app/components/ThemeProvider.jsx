
"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { CmsThemeProvider } from "@/app/components/CmsThemeProvider";

export { useTheme };

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange
    >
      <CmsThemeProvider>
        {children}
      </CmsThemeProvider>
    </NextThemesProvider>
  );
}
