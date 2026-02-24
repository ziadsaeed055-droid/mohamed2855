import type React from "react"
import type { Metadata } from "next"
import { Cairo, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ChatProvider } from "@/contexts/chat-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { LoyaltyProvider } from "@/contexts/loyalty-context"
import { WelcomeModal } from "@/components/welcome-modal"
import { WelcomeBonusModal } from "@/components/welcome-bonus-modal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { RecentlyViewedProvider } from "@/contexts/recently-viewed-context"
import { AIChatAssistant } from "@/components/ai-chat-assistant"
import { ConsoleWelcome } from "@/components/console-welcome"
import { SplashScreenProvider } from "@/components/splash-screen-provider"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0d3b66",
  colorScheme: "light dark",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://sevenblue.store"),
  title: "Seven Blue | متجر الملابس الراقية الفاخرة | أزياء رجالي وحريمي وأطفالي",
  description:
    "Seven Blue - Wearing for you. متجر ملابس أنيق متخصص في الأزياء الفاخرة والراقية للرجال والنساء والأطفال. تشكيلات عصرية وتقليدية بأسعار منافسة. تسوق أونلاين الآن!",
  keywords: [
    "متجر ملابس",
    "ملابس راقية",
    "أزياء فاخرة",
    "Seven Blue",
    "ملابس رجالي",
    "ملابس نسائي",
    "ملابس أطفال",
    "تيشيرتات",
    "بناطيل",
    "فساتين",
    "جاكيتات",
    "موضة",
    "جلاليب رجالية",
    "عبايات",
    "ملابس عصرية",
    "ملابس تقليدية",
    "تسوق أون لاين",
    "شراء ملابس أون لاين",
    "ملابس مصرية",
    "ملابس عالية الجودة",
    "شبابي",
    "كاجوال",
    "رسمي",
    "سويترات",
    "معاطف",
    "جينز",
    "شورتات",
    "تنانير",
    "ملابس رياضية",
    "ملابس السباحة",
    "بدل رسمية",
    "بلوزات",
    "قمصان",
  ],
  authors: [
    {
      name: "Seven Blue",
      url: "https://sevenblue.store",
    },
  ],
  creator: "Seven Blue Team",
  publisher: "Seven Blue",
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US", "en"],
    url: "https://sevenblue.store",
    siteName: "Seven Blue - Wearing for You",
    title: "Seven Blue | متجر الملابس الراقية الفاخرة",
    description:
      "متجر ملابس متخصص في الأزياء الفاخرة والراقية. تشكيلات عصرية وتقليدية للرجال والنساء والأطفال. جودة عالية وأسعار منافسة.",
    images: [
      {
        url: "/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Seven Blue - Wearing for you - متجر الملابس الراقية",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seven Blue | متجر الملابس الراقية الفاخرة",
    description: "متجر ملابس متخصص في الأزياء الفاخرة. تسوق أون لاين الآن!",
    images: [
      {
        url: "/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Seven Blue",
      },
    ],
    creator: "@SevenBlue",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seven Blue",
  },
  applicationName: "Seven Blue",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  category: "shopping",
  generator: "v0.app",
  alternates: {
    canonical: "https://sevenblue.store",
    languages: {
      ar: "https://sevenblue.store/ar",
      en: "https://sevenblue.store/en",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d3b66" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${cairo.variable} ${playfair.variable} font-sans antialiased`}>
        <ConsoleWelcome />
        <SplashScreenProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <LoyaltyProvider>
                  <RecentlyViewedProvider>
                    <CartProvider>
                      <ChatProvider>
                        <ScrollToTop />
                        {children}
                        <WelcomeModal />
                        <WelcomeBonusModal />
                        <AIChatAssistant />
                        <Toaster />
                      </ChatProvider>
                    </CartProvider>
                  </RecentlyViewedProvider>
                </LoyaltyProvider>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </SplashScreenProvider>
        <Analytics />
      </body>
    </html>
  )
}
