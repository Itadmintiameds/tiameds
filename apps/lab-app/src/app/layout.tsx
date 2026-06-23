import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { Noto_Sans, Work_Sans, Open_Sans } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LabProvider } from '@/context/LabContext';
import TokenExpirationHandler from '@/components/TokenExpirationHandler';
import IdleLogoutHandler from '@/components/IdleLogoutHandler';

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "TiaMeds Labs",
  metadataBase: new URL("https://tiameds.com"),
  description: "TiaMeds Labs is a platform for Lab Managment, providing tools for managing lab data, experiments, and results.",
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
    <LabProvider>
      <html lang="en">
        <body
  className={`${notoSans.variable} ${workSans.variable} ${openSans.variable}`}
>
          <TokenExpirationHandler />
          <IdleLogoutHandler />
          {children}
          <ToastContainer />
        </body>
      </html>
    </LabProvider>
  );
}












// code by abhishek................

// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";


// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { LabProvider } from '@/context/LabContext';
// import TokenExpirationHandler from '@/components/TokenExpirationHandler';
// import IdleLogoutHandler from '@/components/IdleLogoutHandler';

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata: Metadata = {
//   title: "TiaMeds Labs",
//   metadataBase: new URL("https://tiameds.com"),
//   description: "TiaMeds Labs is a platform for Lab Managment, providing tools for managing lab data, experiments, and results.",
//   icons: {
//     icon: '/tiamed1.svg',
//     shortcut: '/tiamed1.svg',
//     apple: '/tiamed1.svg',
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <LabProvider>
//       <html lang="en">
//         <body 
//           className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//         >
//           <TokenExpirationHandler />
//           <IdleLogoutHandler />
//           {children}
//           <ToastContainer />
//         </body>
//       </html>
//     </LabProvider>
//   );
// }