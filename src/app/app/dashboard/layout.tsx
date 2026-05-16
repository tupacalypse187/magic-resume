import { ReactNode } from "react";
import { Metadata } from "next";
import { NextIntlClientProvider } from "@/i18n/compat/client";
import { getMessages, getTranslations, setRequestLocale } from "@/i18n/compat/server";
import Document from "@/components/Document";
import { Providers } from "@/app/providers";
import Client from "./client";
import { cookies } from "next/headers";
import { defaultLocale, Locale, locales } from "@/i18n/config";

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (!cookieValue) return defaultLocale;
  if (locales.includes(cookieValue as Locale)) return cookieValue as Locale;
  return defaultLocale;
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title") + " - " + t("dashboard"),
  };
}
export default async function LocaleLayout({ children }: Props) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("NEXT_LOCALE")?.value);
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <Document locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <Client>{children}</Client>
        </Providers>
      </NextIntlClientProvider>
    </Document>
  );
}
