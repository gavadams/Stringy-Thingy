import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stringy-Thingy - String Art Kit Business Platform",
  description: "Create beautiful string art designs with our easy-to-use generator. Transform your ideas into stunning geometric patterns and share them with the world.",
  keywords: ["string art", "generator", "design", "geometric", "patterns", "DIY"],
  authors: [{ name: "Stringy-Thingy Team" }],
  openGraph: {
    title: "Stringy-Thingy - String Art Kit Business Platform",
    description: "Create beautiful string art designs with our easy-to-use generator.",
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
      <body className="font-sans antialiased min-h-screen flex flex-col">
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
