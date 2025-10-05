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
  title: "Stringy-Thingy - Transform Your Photos Into Stunning String Art",
  description: "Create beautiful, personalized wall art with our complete DIY string art kits. Upload your photo, follow our custom instructions, and make something truly unique. Perfect for beginners and experienced crafters.",
  keywords: [
    "string art", 
    "DIY string art", 
    "string art kits", 
    "personalized art", 
    "photo to string art", 
    "custom string art", 
    "crafts", 
    "DIY projects", 
    "wall art", 
    "creative gifts"
  ],
  authors: [{ name: "Stringy-Thingy Team" }],
  creator: "Stringy-Thingy",
  publisher: "Stringy-Thingy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Stringy-Thingy - Transform Your Photos Into Stunning String Art",
    description: "Create beautiful, personalized wall art with our complete DIY string art kits. Upload your photo, follow our custom instructions, and make something truly unique.",
    type: "website",
    url: "https://stringy-thingy.com",
    siteName: "Stringy-Thingy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stringy-Thingy - String Art Kits",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stringy-Thingy - Transform Your Photos Into Stunning String Art",
    description: "Create beautiful, personalized wall art with our complete DIY string art kits.",
    images: ["/twitter-image.jpg"],
    creator: "@stringythingy",
  },
  alternates: {
    canonical: "https://stringy-thingy.com",
  },
  category: "Arts & Crafts",
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
