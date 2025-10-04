import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary-50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Stringy-Thingy
              </span>
            </Link>
            <p className="text-secondary-600 text-sm max-w-md">
              Create beautiful string art designs with our easy-to-use generator. 
              Transform your ideas into stunning geometric patterns and share them with the world.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-secondary-500">
              © 2024 Stringy-Thingy. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-secondary-500 hover:text-primary-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-secondary-500 hover:text-primary-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-secondary-500 hover:text-primary-500 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
