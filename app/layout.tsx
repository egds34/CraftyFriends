import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SignOutProvider } from "@/providers/SignOutProvider";
import { CartProvider } from "@/components/providers/cart-provider";

const superAdorable = localFont({
  src: "./fonts/SuperAdorable.ttf",
  variable: "--font-super-adorable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: "Crafty Friends",
  openGraph: {
    title: "Crafty Friends",
    description: "A Minecraft server created by banjomonkey420",
    url: '/',
    siteName: 'Crafty Friends',
    locale: 'en_US',
    type: 'website',
  },
};

import { ThemeToggle } from "@/components/theme-toggle";
import Navbar from "@/components/navbar";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${superAdorable.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <SignOutProvider>
            <CartProvider>
              <Navbar />
              {children}
            </CartProvider>
          </SignOutProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
