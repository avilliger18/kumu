import type { Metadata } from "next";
import { Zain, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "~/lib/utils";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "~/providers/ConvexClientProvider";
import AuthGuard from "~/components/AuthGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const zain = Zain({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-zain",
});

export const metadata: Metadata = {
  title: "Kumu",
  description: "Track your food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, zain.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <AuthGuard>{children}</AuthGuard>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
