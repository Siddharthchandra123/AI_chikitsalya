"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-right" closeButton richColors />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
