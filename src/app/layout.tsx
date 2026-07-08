import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/providers/app-providers";
import { APP_DESCRIPTION, APP_NAME } from "@/constants/app";
import { env } from "@/config/env";
import "@/styles/globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#063b35",
  colorScheme: "light dark"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${serif.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
