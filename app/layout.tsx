import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SignOutProvider } from "@/providers/SignOutProvider";
import { CartProvider } from "@/components/providers/cart-provider";

const superAdorable = localFont({
  src: "./fonts/SuperAdorable.ttf",
  variable: "--font-heading",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
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
import { auth } from "@/auth";
import { AccountCompletionModal } from "@/components/account-completion-modal";


// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${superAdorable.variable} ${geistMono.variable} antialiased font-sans`}
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
            <AccountCompletionModal session={session} />
          </SignOutProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
