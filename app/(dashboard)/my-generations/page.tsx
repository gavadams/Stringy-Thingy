"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserGenerations, deleteGeneration } from '@/lib/generator/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Download, Eye, Trash2, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Generation {
  id: string;
  image_url: string;
  settings: Record<string, unknown>;
  created_at: string;
  kit_code_id: string;
}

export default function MyGenerationsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterGenerations();
  }, [generations, searchTerm, filterType, sortBy]);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      await loadGenerations(user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadGenerations = async (userId: string) => {
    try {
      const data = await getUserGenerations(userId);
      setGenerations(data);
    } catch (error) {
      console.error('Failed to load generations:', error);
      setError('Failed to load your generations');
    }
  };

  const filterGenerations = () => {
    let filtered = [...generations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(gen => 
        gen.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.settings?.frameShape?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(gen => 
        gen.settings?.frameShape === filterType
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredGenerations(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this generation?')) return;

    try {
      const success = await deleteGeneration(id, user.id);
      if (success) {
        setGenerations(prev => prev.filter(gen => gen.id !== id));
      } else {
        setError('Failed to delete generation');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete generation');
    }
  };

  const handleDownload = (generation: Generation) => {
    // TODO: Implement download functionality
    console.log('Download generation:', generation.id);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Generations</h1>
            <p className="text-lg text-muted-foreground">
              View and manage your string art patterns
            </p>
          </div>
          <Link href="/generate">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search generations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Generations Grid */}
        {filteredGenerations.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Generations Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first string art pattern to get started.
                </p>
                <Link href="/generate">
                  <Button>Create Your First Pattern</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGenerations.map((generation) => (
              <Card key={generation.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={generation.image_url}
                    alt="String art pattern"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {generation.settings?.frameShape || 'circle'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(generation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Pegs: {generation.settings?.pegs || 'N/A'}</p>
                      <p>Lines: {generation.settings?.lines || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDownload(generation)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/my-generations/${generation.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(generation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredGenerations.length > 12 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
