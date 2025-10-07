"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validateKitCode, getKitTypeSpecs } from '@/lib/generator/validation';
import { uploadImageWithCompression } from '@/lib/generator/storage';
import { createGeneration, incrementKitUsage, getUserKitCodes } from '@/lib/generator/queries';
import StringArtConverter from '@/components/generator/StringArtConverter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';

interface KitCode {
  id: string;
  code: string;
  kit_type: string;
  max_generations: number;
  used_count: number;
}

export default function GeneratePage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [kitCodes, setKitCodes] = useState<KitCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedKitCode, setSelectedKitCode] = useState<KitCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Generate Page - Starting auth check');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Generate Page - Auth user:', user?.id);
      
      if (!user) {
        console.log('Generate Page - No user, redirecting to login');
        router.push('/login');
        return;
      }

      setUser(user);
      console.log('Generate Page - Loading kit codes for user:', user.id);
      await loadKitCodes(user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadKitCodes = async (userId: string) => {
    try {
      console.log('Generate Page - Loading kit codes for user:', userId);
      const codes = await getUserKitCodes(userId);
      console.log('Generate Page - Kit codes received:', codes);
      setKitCodes(codes);
      
      if (codes.length > 0) {
        setSelectedCode(codes[0].id);
        setSelectedKitCode(codes[0]);
      }
    } catch (error) {
      console.error('Failed to load kit codes:', error);
      setError('Failed to load your kit codes');
    }
  };

  const handleKitCodeChange = (codeId: string) => {
    setSelectedCode(codeId);
    const kitCode = kitCodes.find(code => code.id === codeId);
    setSelectedKitCode(kitCode || null);
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setError(null);
  };

  const handleGenerate = async (result: { lines: unknown[]; pegs: unknown[]; settings: unknown }) => {
    if (!selectedKitCode || !imageFile || !user) return;

    setProcessing(true);
    setError(null);

    try {
      // Validate kit code one more time
      const validation = await validateKitCode(selectedKitCode.code, user.id);
      if (!validation.valid) {
        setError(validation.error || 'Invalid kit code');
        return;
      }

      // Upload image
      const uploadedImageUrl = await uploadImageWithCompression(imageFile, user.id);

      // Increment kit usage
      const usageIncremented = await incrementKitUsage(selectedKitCode.id);
      if (!usageIncremented) {
        setError('Failed to update kit usage');
        return;
      }

      // Save generation to database
      const generation = await createGeneration({
        user_id: user.id,
        kit_code_id: selectedKitCode.id,
        image_url: uploadedImageUrl,
        settings: result.settings as Record<string, unknown>,
        pattern_data: result
      });

      if (!generation) {
        setError('Failed to save generation');
        return;
      }

      // Reload kit codes to update remaining counts
      await loadKitCodes(user.id);
      
      // Show success message
      setError(null);
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate string art. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (kitCodes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">No Kit Codes Available</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You need to purchase a string art kit to start generating patterns.
          </p>
          <Link href="/shop">
            <Button size="lg" className="gap-2">
              <ShoppingCart className="w-5 h-5" />
              Browse Kits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const kitSpecs = selectedKitCode ? getKitTypeSpecs(selectedKitCode.kit_type) : null;
  const remaining = selectedKitCode ? selectedKitCode.max_generations - selectedKitCode.used_count : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Generate String Art</h1>
          <p className="text-lg text-muted-foreground">
            Transform your photos into beautiful string art patterns
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Kit Code Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Select Kit Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedCode} onValueChange={handleKitCodeChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a kit code" />
                </SelectTrigger>
                <SelectContent>
                  {kitCodes.map((code) => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.code} ({code.kit_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedKitCode && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {remaining} remaining
                  </Badge>
                  <Badge variant="secondary">
                    {selectedKitCode.kit_type}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generator Component */}
        {selectedKitCode && kitSpecs && (
          <StringArtConverter
            onGenerate={handleGenerate}
            onImageUpload={handleImageUpload}
            kitCode={selectedKitCode.code}
            remainingGenerations={remaining}
            isProcessing={processing}
            disabled={remaining <= 0}
          />
        )}

        {/* Kit Specifications Info */}
        {selectedKitCode && kitSpecs && (
          <Card>
            <CardHeader>
              <CardTitle>Kit Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Pegs</p>
                  <p className="text-muted-foreground">{kitSpecs.pegs} pegs</p>
                </div>
                <div>
                  <p className="font-medium">Max Lines</p>
                  <p className="text-muted-foreground">{kitSpecs.maxLines} lines</p>
                </div>
                <div>
                  <p className="font-medium">Frame Shapes</p>
                  <p className="text-muted-foreground">{kitSpecs.frameShapes.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
