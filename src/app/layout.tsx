import type { Metadata } from 'next';
import { Montserrat, Almendra, Marcellus } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const almendra = Almendra({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-decorative",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Story Platform - Discover Amazing Stories',
  description: 'Explore our collection of captivating books. Read free chapters and unlock premium content from talented authors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${montserrat.variable} ${almendra.variable}`}
    >
      <body className="min-h-screen bg-accent-primary text-text-primary">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
