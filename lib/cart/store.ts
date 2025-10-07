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

// Custom storage that checks if cart should be cleared
const customStorage = {
  getItem: (name: string) => {
    try {
      if (typeof window === 'undefined') return null;
      
      // Check if there's a purchase completion flag
      const purchaseCompleted = localStorage.getItem('cart-purchase-completed');
      
      if (purchaseCompleted === 'true') {
        // Cart was cleared after purchase, return empty state
        console.log('Purchase completed - returning empty cart');
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
      if (typeof window === 'undefined') return;
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting cart in storage:', error);
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window === 'undefined') return;
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
        // Clear the purchase completed flag when adding items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart-purchase-completed');
        }
        
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          let newItems;
          
          if (existingItem) {
            newItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
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
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
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
          
          if (savedCart) {
            const cartData = JSON.parse(savedCart);
            const savedItems = cartData.items || [];
            
            const currentCartData = JSON.stringify({ items: currentItems });
            const savedCartData = JSON.stringify({ items: savedItems });
            
            if (currentCartData !== savedCartData && (currentItems.length > 0 || savedItems.length > 0)) {
              const mergedItems = [...currentItems];
              
              savedItems.forEach((savedItem: CartItem) => {
                const existingItem = mergedItems.find(item => item.id === savedItem.id);
                if (existingItem) {
                  existingItem.quantity += savedItem.quantity;
                } else {
                  mergedItems.push(savedItem);
                }
              });
              
              set({ items: mergedItems });
              localStorage.setItem(userCartKey, JSON.stringify({ items: mergedItems }));
            } else {
              set({ items: savedItems });
            }
          } else {
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
        try {
          localStorage.removeItem('cart-storage');
        } catch (error) {
          console.error('Error clearing anonymous cart:', error);
        }
      },

      clearCartAfterPurchase: () => {
        console.log('Clearing cart after purchase');
        
        // Set a persistent flag that survives page refreshes
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart-purchase-completed', 'true');
        }
        
        // Clear the cart state
        set({ items: [] });
        
        // Clear all cart-related localStorage
        try {
          localStorage.removeItem('cart-storage');
          const currentUserId = get().currentUserId;
          if (currentUserId) {
            localStorage.removeItem(`cart-${currentUserId}`);
          }
        } catch (error) {
          console.error('Error clearing cart storage:', error);
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);