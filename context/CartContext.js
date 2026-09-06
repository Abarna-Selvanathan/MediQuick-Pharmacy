"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mediquick-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  function addItem(product, quantity = 1) {
    if (product.prescriptionRequired) {
      return {
        ok: false,
        message: "This item requires an approved prescription. Please upload a prescription first."
      };
    }

    if (product.stock <= 0) {
      return { ok: false, message: "This product is currently out of stock." };
    }

    let message = "Item added to cart.";
    let ok = true;

    setItems((current) => {
      const existing = current.find((item) => item.productId === product._id);
      const nextQuantity = (existing?.quantity || 0) + quantity;

      if (nextQuantity > product.stock) {
        ok = false;
        message = "Quantity cannot exceed available stock.";
        return current;
      }

      if (existing) {
        return current.map((item) =>
          item.productId === product._id ? { ...item, quantity: nextQuantity, stock: product.stock } : item
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          stock: product.stock
        }
      ];
    });

    return { ok, message };
  }

  function updateQuantity(productId, quantity) {
    setItems((current) =>
      current
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }

          const nextQuantity = Math.max(1, Math.min(quantity, item.stock));
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      itemCount
    }),
    [items, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
