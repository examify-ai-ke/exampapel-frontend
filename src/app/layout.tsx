import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Notifications } from "@/components/ui/notifications";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: ["exam papers", "education", "academic", "study materials"],
  authors: [{ name: "Exampapel Team" }],
  creator: "Exampapel",
  publisher: "Exampapel",
  robots: "index, follow",
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Notifications />
      </body>
    </html>
  );
}
