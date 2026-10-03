import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../infrastructure/http/apiClient';

interface User {
  username: string;
  role: 'admin' | 'seller';
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  availableStock: number;
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; stock: number }, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (username: string, pass: string) => {
    const res = await apiClient.login(username, pass);
    setUser({ username: res.username, role: res.role });
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setCart([]);
  };

  const addToCart = (product: { id: string; name: string; price: number; stock: number }, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          availableStock: product.stock,
          quantity: qty,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};