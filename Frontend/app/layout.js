
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CmsThemeProvider } from "@/app/components/CmsThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SmartSchool",
  description: "SmartSchool - All-in-One School Management System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CmsThemeProvider>
          <div className="app-theme min-h-full flex-1">
            {children}
          </div>
        </CmsThemeProvider>
      </body>
    </html>
  );
}
