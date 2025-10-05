import { Suspense } from "react";
import { getAllProducts } from "@/lib/products/queries";
import ProductCard from "@/components/shop/ProductCard";
import Cart from "@/components/shop/Cart";
import ShopFilters from "@/components/shop/ShopFilters";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ShopPageProps {
  searchParams: Promise<{
    type?: string;
    sort?: string;
    view?: string;
  }>;
}

async function ProductsGrid({ searchParams }: { searchParams: { type?: string; sort?: string; view?: string; } }) {
  const { data: allProducts, error } = await getAllProducts();

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading products: {error}
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Check back later for new products!
        </p>
      </div>
    );
  }

  // Filter products by type
  let filteredProducts = allProducts;
  if (searchParams.type && searchParams.type !== 'all') {
    filteredProducts = allProducts.filter(product => product.kit_type === searchParams.type);
  }

  // Sort products
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case 'price-low':
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredProducts = [...filteredProducts].sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
      case 'popularity':
      default:
        // Keep original order (most popular first based on our seed data)
        break;
    }
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters to see more products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredProducts.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={index}
        />
      ))}
    </div>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              String Art Kits
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect kit for your next creative project. 
              Each kit includes everything you need to create stunning string art.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <ShopFilters searchParams={resolvedSearchParams} />

        {/* Products Grid */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        }>
          <ProductsGrid searchParams={resolvedSearchParams} />
        </Suspense>
      </div>

      {/* Cart */}
      <Cart />
    </div>
  );
}