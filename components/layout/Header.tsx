"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, LogOut, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { getItemCount, openCart } = useCartStore();

  const supabase = createClient();
  const cartItemCount = getItemCount();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
      
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profile);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
        
        // Force a page refresh to ensure state is updated
        if (event === 'SIGNED_OUT') {
          window.location.reload();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed out successfully");
        setUser(null);
        setProfile(null);
        router.push('/login?message=You have been signed out successfully');
      }
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Stringy-Thingy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-purple-600"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium transition-colors hover:text-purple-600"
            >
              Shop
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium transition-colors hover:text-purple-600"
            >
              How It Works
            </Link>
          </nav>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCart}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>

                {isLoading ? (
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                ) : user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {user.email || 'User'}
                    </span>
                    {profile?.role === 'admin' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">Admin</Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/my-generations">My Generations</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/login">Sign Up</Link>
                    </Button>
                  </>
                )}
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
                className="text-sm font-medium transition-colors hover:text-purple-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium transition-colors hover:text-purple-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium transition-colors hover:text-purple-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              
              {/* Mobile Cart Button */}
              <Button
                variant="ghost"
                onClick={() => {
                  openCart();
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user.email || 'User'}
                  </div>
                  {profile?.role === 'admin' && (
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/my-generations" onClick={() => setIsMobileMenuOpen(false)}>
                      My Generations
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
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
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
