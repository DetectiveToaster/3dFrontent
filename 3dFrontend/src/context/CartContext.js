// src/context/CartContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../Services/api";
import { toast } from "react-toastify";

// Create context
const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

function getInitialCart() {
  const saved = localStorage.getItem("guest_cart");
  return saved ? JSON.parse(saved) : [];
}

export function CartProvider({ user, children }) {
  const [cartItems, setCartItems] = useState(getInitialCart());

  // Sync guest cart with localStorage
  useEffect(() => {
    if (!user) localStorage.setItem("guest_cart", JSON.stringify(cartItems));
  }, [cartItems, user]);

  // When user logs in: fetch cart from backend, else use local
  useEffect(() => {
    if (user) {
      api.get("/cart/").then(res => setCartItems(res.data)).catch(() => setCartItems([]));
    } else {
      setCartItems(getInitialCart());
    }
  }, [user]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (user) {
      // Backend cart (try update, then add)
      const existing = cartItems.find(i => i.product_id === product.id);
      if (existing) {
        await api.put(`/cart/${existing.id}`, { quantity: existing.quantity + quantity });
      } else {
        await api.post("/cart/", { user_id: user.id, product_id: product.id, quantity });
      }
      // Refresh cart from backend
      const res = await api.get("/cart/");
      setCartItems(res.data);
      toast.success("Added to cart");
    } else {
      // Guest cart (localStorage)
      setCartItems(prev => {
        const idx = prev.findIndex(i => i.product_id === product.id);
        let next;
        if (idx !== -1) {
          next = [...prev];
          next[idx].quantity += quantity;
        } else {
          next = [...prev, { product_id: product.id, product, quantity }];
        }
        localStorage.setItem("guest_cart", JSON.stringify(next));
        toast.success("Added to cart");
        return next;
      });
    }
  };

  // Update item quantity
  const updateCartItem = async (product_id, quantity) => {
    if (user) {
      const existing = cartItems.find(i => i.product_id === product_id);
      if (existing) {
        await api.put(`/cart/${existing.id}`, { quantity });
        const res = await api.get("/cart/");
        setCartItems(res.data);
        toast.info("Cart updated");
      }
    } else {
      setCartItems(prev => {
        const next = prev.map(i => (i.product_id === product_id ? { ...i, quantity } : i));
        localStorage.setItem("guest_cart", JSON.stringify(next));
        toast.info("Cart updated");
        return next;
      });
    }
  };

  // Remove item
  const removeCartItem = async (product_id) => {
    if (user) {
      const existing = cartItems.find(i => i.product_id === product_id);
      if (existing) {
        await api.delete(`/cart/${existing.id}`);
        const res = await api.get("/cart/");
        setCartItems(res.data);
        toast.info("Item removed");
      }
    } else {
      setCartItems(prev => {
        const next = prev.filter(i => i.product_id !== product_id);
        localStorage.setItem("guest_cart", JSON.stringify(next));
        toast.info("Item removed");
        return next;
      });
    }
  };

  // Clear cart
  const clearCart = () => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem("guest_cart");
    }
    // for users, handled after order placed
    toast.info("Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
