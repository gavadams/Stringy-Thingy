"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  
  // Computed values
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

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
        set({ items: [] });
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
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
