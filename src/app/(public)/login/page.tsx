"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn(email, password);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Successfully signed in!");
      router.push("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signUp(email, password);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Account created! Please check your email to verify your account.");
    }
    
    setIsLoading(false);
  };

  const handleRedeemCode = async (formData: FormData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // First create account
    const signUpResult = await signUp(email, password);
    
    if (signUpResult?.error) {
      setError(signUpResult.error);
      setIsLoading(false);
      return;
    }

    // Then redeem kit code (this would need to be done after email verification)
    setSuccess("Account created! Please check your email to verify, then you can redeem your kit code.");
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome to Stringy-Thingy
          </h1>
          <p className="text-secondary-600 mt-2">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Kit</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="mt-1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up for a new Stringy-Thingy account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="mt-1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Redeem Kit Code</CardTitle>
                <CardDescription>
                  Create an account and redeem your kit code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleRedeemCode} className="space-y-4">
                  <div>
                    <Label htmlFor="redeem-email">Email</Label>
                    <Input
                      id="redeem-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="redeem-password">Password</Label>
                    <Input
                      id="redeem-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kitCode">Kit Code</Label>
                    <Input
                      id="kitCode"
                      name="kitCode"
                      type="text"
                      placeholder="Enter your kit code"
                      className="mt-1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Redeem Kit Code"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}
