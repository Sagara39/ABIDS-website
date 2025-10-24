'use client';

import type { CartItem, MenuItem, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { signInAnonymously } from 'firebase/auth';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  placeOrder: (userId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('canteen-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems]);

  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your order.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = async (userId: string) => {
    if (!firestore) {
      throw new Error("Firestore is not initialized.");
    }
    if (cartItems.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const userRef = doc(firestore, 'users', userId);
    const orderData: Omit<Order, 'id'> = {
        userId: userId,
        orderDate: serverTimestamp(),
        totalAmount: total,
        itemCount: itemCount,
        orderItems: cartItems.map(item => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        status: 'completed'
    };

    await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
            throw new Error("Card not registered. Please register your card.");
        }

        const currentBalance = userDoc.data().credit_balance || 0;
        if (currentBalance < total) {
            throw new Error(`Insufficient funds. Your balance is Rs. ${currentBalance.toFixed(2)}`);
        }

        const newBalance = currentBalance - total;
        transaction.update(userRef, { credit_balance: newBalance });

        const newOrderRef = doc(collection(firestore, 'orders'));
        transaction.set(newOrderRef, orderData);
    });

    clearCart();
  };


  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        placeOrder,
      }}
    >
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
