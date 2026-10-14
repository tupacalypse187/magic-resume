import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { useLocale } from "@/i18n/compat/client";
import { useResumeDirectorySync } from "@/hooks/useResumeDirectorySync";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { useEffect, useRef } from "react";

export function Providers({
  children,
  forcedTheme,
}: {
  children: React.ReactNode;
  forcedTheme?: "light";
}) {
  const locale = useLocale();
  const loaded = useRef(false);
  useResumeDirectorySync();

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      useAIConfigStore.getState().loadFromFileDefaults();
    }
  }, []);

  return (
    <HeroUIProvider locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme={forcedTheme}
        enableSystem
        disableTransitionOnChange
        storageKey="magic-resume-theme"
      >
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
