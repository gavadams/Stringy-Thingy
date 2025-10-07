"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getGenerationById, deleteGeneration } from '@/lib/generator/queries';
import { downloadInstructionsPDF, downloadTextInstructions } from '@/lib/generator/pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Eye, 
  Settings, 
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Generation {
  id: string;
  user_id: string;
  kit_code_id: string;
  image_url: string;
  settings: Record<string, any>;
  pattern_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function GenerationDetailPage() {
  const [user, setUser] = useState<any>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const generationId = params.id as string;

  useEffect(() => {
    checkAuth();
  }, [generationId]);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      await loadGeneration(user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadGeneration = async (userId: string) => {
    try {
      const data = await getGenerationById(generationId);
      
      if (!data) {
        setError('Generation not found');
        return;
      }

      if (data.user_id !== userId) {
        setError('You do not have permission to view this generation');
        return;
      }

      setGeneration(data);
    } catch (error) {
      console.error('Failed to load generation:', error);
      setError('Failed to load generation');
    }
  };

  const handleDelete = async () => {
    if (!user || !generation) return;
    
    if (!confirm('Are you sure you want to delete this generation? This action cannot be undone.')) return;

    try {
      const success = await deleteGeneration(generation.id, user.id);
      if (success) {
        router.push('/my-generations');
      } else {
        setError('Failed to delete generation');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete generation');
    }
  };

  const handleDownloadInstructions = async () => {
    if (!generation) return;
    
    setDownloading(true);
    try {
      await downloadInstructionsPDF({
        lines: generation.pattern_data?.lines || [],
        pegs: generation.pattern_data?.pegs || [],
        settings: generation.settings,
        kitType: 'standard'
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to text instructions
      downloadTextInstructions({
        lines: generation.pattern_data?.lines || [],
        pegs: generation.pattern_data?.pegs || [],
        settings: generation.settings,
        kitType: 'standard'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generation) return;
    
    const link = document.createElement('a');
    link.href = generation.image_url;
    link.download = `string-art-pattern-${generation.id}.png`;
    link.click();
  };

  const handleGenerateSimilar = () => {
    if (!generation) return;
    
    // Navigate to generate page with pre-filled settings
    const settings = encodeURIComponent(JSON.stringify(generation.settings));
    router.push(`/generate?settings=${settings}`);
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

  if (error || !generation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Generation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'This generation could not be found or you do not have permission to view it.'}
          </p>
          <Link href="/my-generations">
            <Button>Back to My Generations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/my-generations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Generation Details</h1>
              <p className="text-muted-foreground">
                Created {new Date(generation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerateSimilar}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Similar
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Pattern Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Pattern Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-w-2xl mx-auto">
              <Image
                src={generation.image_url}
                alt="String art pattern"
                fill
                className="object-contain rounded-lg border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings and Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Frame Shape</span>
                  <Badge variant="outline">
                    {generation.settings?.frameShape || 'circle'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Number of Pegs</span>
                  <span className="text-sm">{generation.settings?.pegs || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Number of Lines</span>
                  <span className="text-sm">{generation.settings?.lines || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Line Weight</span>
                  <span className="text-sm">{generation.settings?.lineWeight || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Generation Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">
                    {new Date(generation.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm">
                    {new Date(generation.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generation ID</span>
                  <span className="text-sm font-mono text-xs">
                    {generation.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kit Code ID</span>
                  <span className="text-sm font-mono text-xs">
                    {generation.kit_code_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Download Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={handleDownloadInstructions}
                disabled={downloading}
                className="h-20 flex flex-col gap-2"
              >
                <Download className="w-6 h-6" />
                {downloading ? 'Generating...' : 'Download Instructions (PDF)'}
              </Button>
              
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <Download className="w-6 h-6" />
                Download Pattern Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Data (if available) */}
        {generation.pattern_data && (
          <Card>
            <CardHeader>
              <CardTitle>Pattern Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(generation.pattern_data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
