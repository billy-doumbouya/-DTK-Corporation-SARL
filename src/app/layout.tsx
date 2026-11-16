import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AuthShortcut } from "@/components/site/auth-shortcut";
import { NavProgress } from "@/components/site/nav-progress";
import { ChatbotWidget } from "@/components/site/chatbot-widget";
import { WhatsAppWidget } from "@/components/site/whatsapp-widget";
import { SocialSidebar } from "@/components/site/social-sidebar";
import { ConditionalChrome } from "@/components/site/conditional-chrome";
import { getSiteSettings } from "@/lib/settings";
import { db } from "@/lib/db";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dtk-corporation.example";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.defaultSeoTitle || "DTK Corporation SARL",
      template: "%s | DTK Corporation SARL",
    },
    description:
      settings?.defaultSeoDescription ||
      "Entreprise guinéenne pluridisciplinaire : BTP, agro-alimentaire, formation, élevage et froid.",
    keywords: [
      "DTK Corporation", "Guinée", "BTP", "agro-alimentaire", "riz guinéen",
      "formation", "climatisation", "sous-traitance", "Conakry", "Kankan", "Siguiri", "Dinguiraye",
    ],
    authors: [{ name: "DTK Corporation SARL" }],
    creator: "DTK Corporation SARL",
    icons: {
      icon: "/dtk-favicon.svg",
      shortcut: "/dtk-favicon.svg",
      apple: "/dtk-favicon.svg",
    },
    openGraph: {
      type: "website",
      locale: "fr_GN",
      url: siteUrl,
      siteName: settings?.siteName || "DTK Corporation SARL",
      title: settings?.defaultSeoTitle || "DTK Corporation SARL",
      description: settings?.defaultSeoDescription || "",
      images: settings?.defaultOgImage ? [{ url: settings.defaultOgImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.defaultSeoTitle || "DTK Corporation SARL",
      description: settings?.defaultSeoDescription || "",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport = {
  themeColor: "#101B91",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings().catch(() => null);
  const services = await db.service
    .findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: { slug: true, shortTitle: true, title: true, isSubcontracting: true },
    })
    .catch(() => []);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* Flex column: header → main (grows) → footer (bottom) */}
          <div className="relative flex min-h-screen flex-col">
            <NavProgress />
            <AuthShortcut />
            {/* Header (hidden on dashboard/auth) */}
            <ConditionalChrome>
              <SiteHeader services={services as any} settings={settings as any} />
            </ConditionalChrome>
            {/* Social sidebar (hidden on dashboard/auth) */}
            <ConditionalChrome>
              <SocialSidebar settings={settings as any} />
            </ConditionalChrome>
            {/* Main content fills available space */}
            <main className="flex-1 flex flex-col">{children}</main>
            {/* Footer + floating widgets (hidden on dashboard/auth) */}
            <ConditionalChrome>
              {settings?.chatbotEnabled !== false && (
                <ChatbotWidget settings={settings as any} />
              )}
              {settings?.whatsapp && (
                <WhatsAppWidget whatsapp={settings.whatsapp} />
              )}
              <SiteFooter settings={settings as any} />
            </ConditionalChrome>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
