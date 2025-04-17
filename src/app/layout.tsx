import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Navbar from "./_components/Navbar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "koomastudio",
  description: "An app for drafting LinkedIn Posts",
  icons: [
    { rel: "icon", url: "/influence-icon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/influenceicon.png", type: "image/png" },
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
          </TRPCReactProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
