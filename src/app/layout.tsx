import type { Metadata } from "next";
import {
  Geist_Mono,
  Inter,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getMessages } from "@/lib/i18n/dictionary";
import { locales } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Editorial display serif for the marketing headings. The `opsz` axis lets the
// same family run high-contrast at hero sizes and steady at section sizes.
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-source-serif",
  display: "swap",
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const languages = Object.fromEntries(
    locales.map((code) => [code, `/${code}`])
  ) as Record<string, string>;
  languages["x-default"] = "/en";

  return {
    title: {
      default: messages.meta.titleDefault,
      template: messages.meta.titleTemplate,
    },
    description: messages.meta.description,
    applicationName: "Kepler",
    alternates: {
      languages,
    },
  };
}

const themeScript = `
  (function () {
    try {
      var root = document.documentElement;
      var mode = localStorage.getItem("theme");
      // "dark" is the pre-Day/Night value; "system" now resolves to day.
      if (mode === "night" || mode === "dark") root.classList.add("dark");
      var themes = ["charcoal-coral","royal-blush","deep-blue-sky","crimson-ivory"];
      var color = localStorage.getItem("color-theme");
      root.setAttribute(
        "data-theme",
        themes.indexOf(color) >= 0 ? color : "deep-blue-sky"
      );
    } catch (e) {}
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider locale={locale} messages={messages}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
