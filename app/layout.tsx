import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stringy-Thingy - String Art Kit Business Platform",
  description: "Create beautiful string art with our comprehensive kits and tools. Perfect for beginners and experienced crafters alike.",
  keywords: ["string art", "crafts", "DIY", "art kits", "creative projects"],
  authors: [{ name: "Stringy-Thingy Team" }],
  openGraph: {
    title: "Stringy-Thingy - String Art Kit Business Platform",
    description: "Create beautiful string art with our comprehensive kits and tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
