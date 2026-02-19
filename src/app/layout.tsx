import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/nav/Navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "koomastudio",
  description: "Save LinkedIn posts you love, remix them into original content with AI",
  icons: [
    { rel: "icon", url: "/wave-favicon.png", type: "image/png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <TRPCReactProvider>
            <Navbar />
            {children}
            <Toaster />
          </TRPCReactProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
