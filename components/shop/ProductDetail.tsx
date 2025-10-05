"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Star, 
  Check, 
  Minus, 
  Plus,
  Heart
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { Database } from "@/types/database.types";

type Product = Database['public']['Tables']['products']['Row'];

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem, getItemQuantity, openCart } = useCartStore();
  
  const cartQuantity = getItemQuantity(product.id);
  const isInCart = cartQuantity > 0;
  const isLowStock = product.stock < 10;
  const isOutOfStock = product.stock === 0;
  const isMostPopular = product.kit_type === 'standard';

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    try {
      addItem(product, quantity);
      openCart();
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const getStockStatus = () => {
    if (isOutOfStock) return { text: "Out of Stock", color: "destructive" };
    if (isLowStock) return { text: "Low Stock", color: "secondary" };
    return { text: "In Stock", color: "default" };
  };

  const stockStatus = getStockStatus();

  const whatsIncluded = [
    "Pre-cut wooden frame",
    "Numbered pegs and notches",
    "Premium cotton string",
    "Online pattern generator access",
    "Step-by-step digital instructions",
    "Finishing kit",
    ...(product.kit_type === 'premium' ? ["Extra string colors", "Display stand", "Gift packaging"] : []),
    ...(product.kit_type === 'standard' ? ["Extra string colors", "Premium finishing kit"] : [])
  ];

  const perfectFor = {
    starter: {
      title: "Perfect for Beginners",
      items: ["First-time crafters", "Learning the basics", "Smaller projects", "Gift giving"]
    },
    standard: {
      title: "Perfect for Regular Crafters",
      items: ["Portrait art", "Medium complexity", "Professional results", "Regular projects"]
    },
    premium: {
      title: "Perfect for Serious Artists",
      items: ["Gallery-quality pieces", "Complex designs", "Commission work", "Experienced crafters"]
    }
  };

  const currentPerfectFor = perfectFor[product.kit_type as keyof typeof perfectFor];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[selectedImageIndex]}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Product image failed to load:', product.images[selectedImageIndex]);
                // Fallback to placeholder
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback placeholder */}
          <div className={`absolute inset-0 flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-gray-600 font-medium text-lg">{product.name}</p>
              <p className="text-sm text-gray-500">{product.kit_type}</p>
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-purple-600 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Thumbnail image failed to load:', image);
                    // Hide broken thumbnail
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            {isMostPopular && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Most Popular
              </Badge>
            )}
            <Badge variant={stockStatus.color as "default" | "secondary" | "destructive"}>
              {stockStatus.text}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="text-4xl font-bold text-gray-900">
          £{product.price}
        </div>

        {/* Specs */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900">{product.pegs} Pegs</div>
                <div className="text-gray-600">Number of pegs</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{product.lines} Lines</div>
                <div className="text-gray-600">Maximum lines</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{product.frame_size}</div>
                <div className="text-gray-600">Frame size</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{product.stock} Available</div>
                <div className="text-gray-600">In stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className={`flex-1 py-3 text-lg ${
                isInCart 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isLoading ? (
                "Adding..."
              ) : isInCart ? (
                `In Cart (${cartQuantity})`
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>
            
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* What's Included */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
            <div className="space-y-2">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Perfect For */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{currentPerfectFor.title}</h3>
            <div className="space-y-2">
              {currentPerfectFor.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
