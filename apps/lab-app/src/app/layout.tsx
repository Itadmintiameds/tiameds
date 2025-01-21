import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LabProvider } from '@/context/LabContext';

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
  title: "TiaMeds",
  description: "TiaMeds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LabProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <ToastContainer />
        </body>
      </html>
    </LabProvider>
  );
}
