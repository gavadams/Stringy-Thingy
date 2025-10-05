"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Eye, Star, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { Database } from "@/types/database.types";
import Link from "next/link";

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem, getItemQuantity } = useCartStore();
  
  const quantity = getItemQuantity(product.id);
  const isInCart = quantity > 0;
  const isLowStock = product.stock < 10;
  const isOutOfStock = product.stock === 0;
  const isMostPopular = product.kit_type === 'standard';

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    try {
      addItem(product, 1);
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = () => {
    if (isOutOfStock) return { text: "Out of Stock", color: "destructive" };
    if (isLowStock) return { text: "Low Stock", color: "secondary" };
    return { text: "In Stock", color: "default" };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        {/* Most Popular Badge */}
        {isMostPopular && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Most Popular
            </Badge>
          </div>
        )}

        {/* Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low Stock
            </Badge>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">{product.kit_type}</p>
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
            >
              <Eye className="w-6 h-6 text-gray-700" />
            </motion.div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Product Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                {product.name}
              </h3>
              <Badge variant={stockStatus.color as "default" | "secondary" | "destructive"}>
                {stockStatus.text}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Price */}
            <div className="text-2xl font-bold text-gray-900 mb-4">
              £{product.price}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
              <div>
                <div className="font-semibold">{product.pegs} Pegs</div>
                <div className="text-xs">Pegs</div>
              </div>
              <div>
                <div className="font-semibold">{product.lines} Lines</div>
                <div className="text-xs">Max Lines</div>
              </div>
              <div>
                <div className="font-semibold">{product.frame_size}</div>
                <div className="text-xs">Frame Size</div>
              </div>
              <div>
                <div className="font-semibold">{product.stock}</div>
                <div className="text-xs">In Stock</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1"
              disabled={isOutOfStock}
            >
              <Link href={`/shop/${product.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
            
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className={`flex-1 ${
                isInCart 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isLoading ? (
                "Adding..."
              ) : isInCart ? (
                `In Cart (${quantity})`
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
