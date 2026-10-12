import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FooterSection from "./components/FooterSection";
import HeaderNav from "./components/HeaderNav";
import { INTRO_HEAD_SCRIPT } from "./components/ui/intro";
import Preloader from "./components/ui/Preloader";
import RevealController from "./components/ui/RevealController";
import ScrollProgress from "./components/ui/ScrollProgress";
import SpotlightController from "./components/ui/SpotlightController";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});
const instrumentSerif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TiaMed",
  description: "TiaMed is a platform for healthcare professionals to manage their patients and their health records.",
  icons: {
    icon: '/tiamed1.svg',
    shortcut: '/tiamed1.svg',
    apple: '/tiamed1.svg',
  },
};

export const viewport: Viewport = {
  themeColor: "#07080B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Preloader />
        <ScrollProgress />
        <HeaderNav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <FooterSection />
        <RevealController />
        <SpotlightController />
      </body>
    </html>
  );
}
