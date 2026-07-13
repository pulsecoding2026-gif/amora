import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products, Product } from '@/data/products';

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const storedCart = localStorage.getItem('amora_cart');
    if (storedCart) {
      try {
        const parsedCart: { id: string; quantity: number }[] = JSON.parse(storedCart);
        return parsedCart.map(item => {
          const product = products.find(p => p.id === item.id);
          if (product) {
            return { ...item, product };
          } 
          return undefined; // Or throw error, or handle as invalid item
        }).filter(Boolean) as CartItem[];
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        return [];
      }
    }
  }
  return [];
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);

  useEffect(() => {
    // Synchronously save only id and quantity to localStorage upon state change
    const cartData = items.map(item => ({ id: item.id, quantity: item.quantity }));
    localStorage.setItem('amora_cart', JSON.stringify(cartData));
  }, [items]);

  const addItem = (productId: string, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === productId);
      const product = products.find(p => p.id === productId);

      if (!product) {
        console.warn(`Product with ID ${productId} not found.`);
        return prevItems;
      }

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        return [...prevItems, { id: productId, quantity, product }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};