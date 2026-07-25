import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

const convertPrice = (price: number | { $numberDecimal: string } | undefined): number => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object' && '$numberDecimal' in price) {
    return parseFloat(price.$numberDecimal);
  }
  return 0;
};

interface CartState {
  items: CartItem[];
  currency: string;
  addItem: (item: CartItem) => { success: boolean; message?: string };
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCurrency: () => string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'USD',
      addItem: (item) => {
        const { items } = get();
        if (items.length > 0 && items[0].restaurantId !== item.restaurantId) {
          return {
            success: false,
            message: 'Your cart already contains items from another restaurant. Please clear it first.',
          };
        }

        const existingItem = items.find((i) => i.menuItemId === item.menuItemId);
        if (existingItem) {
          const updatedItems = items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
          set({ items: updatedItems });
        } else {
          set({ 
            items: [...items, { ...item, quantity: 1 }],
            currency: item.currency || 'USD'
          });
        }
        return { success: true };
      },
      removeItem: (menuItemId) =>
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [], currency: 'USD' }),
      getTotal: () => get().items.reduce((sum, item) => sum + convertPrice(item.price) * item.quantity, 0),
      getCurrency: () => get().currency,
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, currency: state.currency }),
    }
  )
);
