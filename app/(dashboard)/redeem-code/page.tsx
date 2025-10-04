"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

export default function RedeemCodePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting kit code redemption for:", code);
      
      // Test Supabase configuration
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Supabase client:", supabase);
      
      // First, get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log("Auth error:", authError);
        toast.error("You must be logged in to redeem a kit code");
        setIsLoading(false);
        return;
      }

      console.log("User authenticated:", user.email);

      // First, let's check if any kit codes exist at all
      console.log("Checking all kit codes...");
      
      const { data: allCodes, error: allCodesError } = await supabase
        .from('kit_codes')
        .select('*');
      
      console.log("All kit codes:", { allCodes, allCodesError });
      
      if (allCodesError) {
        console.log("RLS Error details:", allCodesError);
        toast.error("Database access error: " + allCodesError.message);
        setIsLoading(false);
        return;
      }

      // Check if the kit code exists and is valid
      console.log("Looking for specific code:", code);
      
      // Try without RLS restrictions first
      const { data: kitCode, error: codeError } = await supabase
        .from('kit_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true);
      
      console.log("Kit code search result:", { kitCode, codeError });
      
      if (codeError) {
        console.log("Code search error:", codeError);
        toast.error("Error searching for kit code: " + codeError.message);
        setIsLoading(false);
        return;
      }
      
      if (!kitCode || kitCode.length === 0) {
        toast.error("Invalid or inactive kit code");
        setIsLoading(false);
        return;
      }
      
      const foundKitCode = kitCode[0];
      console.log("Found kit code:", foundKitCode);

      // Check if the code is already redeemed
      if (foundKitCode.redeemed_by) {
        toast.error("This kit code has already been redeemed");
        setIsLoading(false);
        return;
      }

      // Check if user already has a kit code
      const { data: existingCode } = await supabase
        .from('kit_codes')
        .select('*')
        .eq('redeemed_by', user.id)
        .single();

      if (existingCode) {
        toast.error("You already have a kit code linked to your account");
        setIsLoading(false);
        return;
      }

      console.log("Updating kit code with user ID:", user.id);

      // Redeem the kit code
      const { error: redeemError } = await supabase
        .from('kit_codes')
        .update({ redeemed_by: user.id })
        .eq('id', foundKitCode.id);

      console.log("Redeem result:", { redeemError });

      if (redeemError) {
        console.log("Redeem error:", redeemError);
        toast.error("Failed to redeem kit code");
        setIsLoading(false);
        return;
      }

      console.log("Kit code redeemed successfully!");
      toast.success("Kit code redeemed successfully!");
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      console.log("Setting loading to false");
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
