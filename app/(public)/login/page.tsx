"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signUp, signIn, redeemKitCode } from "@/lib/auth/actions";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn(email, password);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Successfully signed in!");
      router.push("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signUp(email, password);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Account created! Please check your email to verify your account.");
    }
    
    setIsLoading(false);
  };

  const handleRedeemCode = async (formData: FormData) => {
    setIsLoading(true);
    const code = formData.get("code") as string;

    const result = await redeemKitCode(code);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Kit code redeemed successfully!");
      router.push("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Welcome to Stringy-Thingy
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Choose your preferred method to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="redeem">Redeem Code</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form action={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form action={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="redeem" className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Redeem Kit Code</h3>
                  <p className="text-sm text-gray-600">
                    Enter your kit code to link it to your account
                  </p>
                </div>
                <form action={handleRedeemCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kit-code">Kit Code</Label>
                    <Input
                      id="kit-code"
                      name="code"
                      type="text"
                      placeholder="Enter your kit code"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Redeeming..." : "Redeem Code"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have a kit code?{" "}
            <a href="/shop" className="text-purple-600 hover:text-purple-500">
              Browse our kits
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}