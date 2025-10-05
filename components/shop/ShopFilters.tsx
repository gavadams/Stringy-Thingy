"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List
} from "lucide-react";

interface ShopFiltersProps {
  searchParams: {
    type?: string;
    sort?: string;
    view?: string;
  };
}

export default function ShopFilters({ searchParams }: ShopFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams);
    
    if (value === "all" || value === "popularity") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Filter by Type */}
      <div className="flex-1">
        <Select 
          value={searchParams.type || "all"}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Kits</SelectItem>
            <SelectItem value="starter">Starter Kits</SelectItem>
            <SelectItem value="standard">Standard Kits</SelectItem>
            <SelectItem value="premium">Premium Kits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="flex-1">
        <Select 
          value={searchParams.sort || "popularity"}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-full">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={searchParams.view === "grid" || !searchParams.view ? "default" : "outline"} 
          size="icon"
          onClick={() => handleFilterChange("view", "grid")}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button 
          variant={searchParams.view === "list" ? "default" : "outline"} 
          size="icon"
          onClick={() => handleFilterChange("view", "list")}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
