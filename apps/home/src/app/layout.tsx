import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HeaderNav from "./components/HeaderNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderNav />
        
        {children}
      </body>
    </html>
  );
}
