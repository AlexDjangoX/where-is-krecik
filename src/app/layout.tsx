import type React from "react";
import { Source_Sans_3 as SourceSans3 } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { fallbackLng } from "@/intl/constants";

import "./globals.css";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={fallbackLng} suppressHydrationWarning>
      <body
        className={`${font.variable} h-screen overflow-hidden bg-lime-50 antialiased dark:bg-[#111827]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
