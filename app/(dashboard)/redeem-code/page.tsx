"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redeemKitCode } from "@/lib/auth/actions";
import { toast } from "sonner";
import { ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

export default function RedeemCodePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await redeemKitCode(code);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Kit code redeemed successfully!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Redeem Kit Code</h1>
          <p className="text-gray-600">
            Enter your kit code to unlock string art generation features
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <CardTitle>Kit Code Redemption</CardTitle>
            </div>
            <CardDescription>
              Link your kit code to your account to start creating string art patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kit Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter your kit code (e.g., STARTER-2024-001)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Your kit code should be printed on your kit packaging
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Redeeming..." : "Redeem Code"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Don&apos;t have a kit code?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Kit codes come with our physical string art kits. Purchase a kit to get started!
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/shop">Browse Kits</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
