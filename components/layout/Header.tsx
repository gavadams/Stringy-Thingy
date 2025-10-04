"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary-600 to-brand-primary-800 bg-clip-text text-transparent">
              Stringy-Thingy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-brand-primary-600"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium transition-colors hover:text-brand-primary-600"
            >
              Shop
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium transition-colors hover:text-brand-primary-600"
            >
              How It Works
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-brand-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium transition-colors hover:text-brand-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium transition-colors hover:text-brand-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
