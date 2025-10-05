"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import Link from "next/link";

export default function Cart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotal, 
    getItemCount 
  } = useCartStore();

  const total = getTotal();
  const itemCount = getItemCount();

  console.log('Cart component render:', { isOpen, items: items.length, itemCount });

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    console.log('Proceeding to checkout...');
    closeCart();
  };

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog onOpenChange:', { open, currentIsOpen: isOpen });
    if (!open) {
      closeCart();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {itemCount}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            // Empty Cart State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Add some products to get started!
              </p>
              <Button asChild onClick={closeCart}>
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </motion.div>
          ) : (
            // Cart Items
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.kit_type} • {item.product.frame_size}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          £{item.product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            
            {/* Cart Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Subtotal</span>
                <span className="text-xl font-bold">£{total.toFixed(2)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Shipping calculated at checkout
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    asChild 
                    className="flex-1"
                    onClick={closeCart}
                  >
                    <Link href="/shop">
                      Continue Shopping
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={clearCart}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
