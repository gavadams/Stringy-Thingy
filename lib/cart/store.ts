"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  currentUserId: string | null;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // User-specific actions
  setUserId: (userId: string | null) => void;
  loadUserCart: (userId: string) => Promise<void>;
  saveUserCart: (userId: string) => Promise<void>;
  clearAnonymousCart: () => void;
  clearCartAfterPurchase: () => void;
  
  // Computed values
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

// Custom storage that respects the cleared flag
const customStorage = {
  getItem: (name: string) => {
    try {
      const wasCleared = localStorage.getItem('cart-cleared-after-purchase');
      if (wasCleared === 'true') {
        console.log('Cart was cleared after purchase, returning empty state');
        return JSON.stringify({ state: { items: [] }, version: 0 });
      }
      return localStorage.getItem(name);
    } catch (error) {
      console.error('Error getting cart from storage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting cart in storage:', error);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing cart from storage:', error);
    }
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserId: null,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          let newItems;
          
          if (existingItem) {
            // Update existing item quantity
            newItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [...state.items, { id: product.id, product, quantity }];
          }
          
          // Save to user cart if user is logged in
          if (state.currentUserId) {
            setTimeout(() => {
              const { saveUserCart } = get();
              saveUserCart(state.currentUserId!);
            }, 0);
          }
          
          return { items: newItems };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== productId);
          
          // Save to user cart if user is logged in
          if (state.currentUserId) {
            setTimeout(() => {
              const { saveUserCart } = get();
              saveUserCart(state.currentUserId!);
            }, 0);
          }
          
          return { items: newItems };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const newItems = state.items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          );
          
          // Save to user cart if user is logged in
          if (state.currentUserId) {
            setTimeout(() => {
              const { saveUserCart } = get();
              saveUserCart(state.currentUserId!);
            }, 0);
          }
          
          return { items: newItems };
        });
      },

      clearCart: () => {
        console.log('Clearing cart, current items:', get().items.length);
        
        // Clear from localStorage first to prevent restore
        try {
          localStorage.removeItem('cart-storage');
          console.log('Cart storage cleared from localStorage');
        } catch (error) {
          console.error('Error clearing cart from localStorage:', error);
        }
        
        // Then clear the state
        set({ items: [] });
        
        // Force a small delay to ensure the state is properly cleared
        setTimeout(() => {
          console.log('Cart cleared, final items:', get().items.length);
        }, 50);
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        console.log('Opening cart, current state:', { isOpen: get().isOpen, items: get().items.length });
        set({ isOpen: true });
        console.log('Cart opened, new state:', { isOpen: get().isOpen });
      },

      closeCart: () => {
        console.log('Closing cart, current state:', { isOpen: get().isOpen });
        set({ isOpen: false });
        console.log('Cart closed, new state:', { isOpen: get().isOpen });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getItemQuantity: (productId: string) => {
        const { items } = get();
        const item = items.find(item => item.id === productId);
        return item ? item.quantity : 0;
      },

      setUserId: (userId: string | null) => {
        set({ currentUserId: userId });
      },

      loadUserCart: async (userId: string) => {
        try {
          const { items: currentItems } = get();
          const userCartKey = `cart-${userId}`;
          const savedCart = localStorage.getItem(userCartKey);
          
          // Removed debug logs to prevent console spam
          
          if (savedCart) {
            const cartData = JSON.parse(savedCart);
            const savedItems = cartData.items || [];
            
            // Only merge if current cart has different items than saved cart
            const currentCartData = JSON.stringify({ items: currentItems });
            const savedCartData = JSON.stringify({ items: savedItems });
            
            if (currentCartData !== savedCartData && (currentItems.length > 0 || savedItems.length > 0)) {
              // Merge current cart with saved cart
              const mergedItems = [...currentItems];
              
              savedItems.forEach((savedItem: CartItem) => {
                const existingItem = mergedItems.find(item => item.id === savedItem.id);
                if (existingItem) {
                  // If item exists in both carts, add quantities
                  existingItem.quantity += savedItem.quantity;
                } else {
                  // If item only exists in saved cart, add it
                  mergedItems.push(savedItem);
                }
              });
              
              set({ items: mergedItems });
              
              // Save the merged cart
              localStorage.setItem(userCartKey, JSON.stringify({ items: mergedItems }));
            } else {
              set({ items: savedItems });
            }
          } else {
            // No saved cart, just save current cart
            localStorage.setItem(userCartKey, JSON.stringify({ items: currentItems }));
          }
        } catch (error) {
          console.error('Error loading user cart:', error);
        }
      },

      saveUserCart: async (userId: string) => {
        try {
          const { items } = get();
          const userCartKey = `cart-${userId}`;
          localStorage.setItem(userCartKey, JSON.stringify({ items }));
        } catch (error) {
          console.error('Error saving user cart:', error);
        }
      },

      clearAnonymousCart: () => {
        // Clear the anonymous cart from localStorage
        try {
          localStorage.removeItem('cart-storage');
        } catch (error) {
          console.error('Error clearing anonymous cart:', error);
        }
      },

      clearCartAfterPurchase: () => {
        console.log('Clearing cart after purchase, current items:', get().items.length);
        
        // Clear localStorage first to prevent any restore
        try {
          localStorage.removeItem('cart-storage');
          // Also clear any other potential cart storage keys
          localStorage.removeItem('cart');
          localStorage.removeItem('shopping-cart');
          console.log('All cart storage cleared from localStorage after purchase');
        } catch (error) {
          console.error('Error clearing cart from localStorage after purchase:', error);
        }
        
        // Clear the state
        set({ items: [] });
        
        // Force a re-render by updating a non-persisted field
        set((state) => ({ ...state, isOpen: false }));
        
        // Set a flag to prevent restoration
        try {
          localStorage.setItem('cart-cleared-after-purchase', 'true');
          console.log('Cart cleared flag set');
        } catch (error) {
          console.error('Error setting cart cleared flag:', error);
        }
        
        console.log('Cart cleared after purchase, final items:', get().items.length);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
