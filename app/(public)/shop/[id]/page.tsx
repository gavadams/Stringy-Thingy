import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products/queries";
import ProductDetail from "@/components/shop/ProductDetail";
import Cart from "@/components/shop/Cart";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { data: product, error } = await getProductById(id);

  if (error || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/shop" className="hover:text-purple-600 transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetail product={product} />
      </div>

      {/* Cart */}
      <Cart />
    </div>
  );
}
