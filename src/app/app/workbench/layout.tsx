import { ReactNode } from "react";
import { Metadata } from "next";
import { NextIntlClientProvider } from "@/i18n/compat/client";
import { getMessages, getTranslations, setRequestLocale } from "@/i18n/compat/server";
import Document from "@/components/Document";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { defaultLocale, Locale, locales } from "@/i18n/config";

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

function getLocaleFromCookie(cookieHeader: string | undefined): Locale {
  if (!cookieHeader) return defaultLocale;
  const match = cookieHeader.split("; ").find((row) => row.startsWith("NEXT_LOCALE="))?.split("=")[1];
  if (match && locales.includes(match as Locale)) return match as Locale;
  return defaultLocale;
}

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title") + " - " + t("dashboard")
  };
}

export default async function LocaleLayout({ children }: Props) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("NEXT_LOCALE")?.value);
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <Document
      locale={locale}
      bodyClassName="overflow-y-hidden w-full"
    >
      <NextIntlClientProvider messages={messages}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </NextIntlClientProvider>
    </Document>
  );
}
