// Frontend/src/context/CartContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "../lib/apiClient";

const DEFAULT_CART_CTX = {
  items: [], itemCount: 0, totalRial: 0n, loading: true,
  addItem: async () => {}, removeItem: async () => {},
  updateQuantity: async () => {}, clearCart: async () => {},
  refreshCart: async () => {},
};
const CartContext = createContext(DEFAULT_CART_CTX);

function mapServerCart(serverCart) {
  if (!serverCart) return [];
  return serverCart.items.map((it) => ({
    cartItemId: it.id,
    productSlug: it.productSlug,
    productTitle: it.productTitle,
    productImage: it.productImage,
    variantId: it.variantId,
    variantName: it.variantName,
    unitPrice: Math.round(Number(it.unitPriceRial) / 10),
  }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  const refetchCart = useCallback(async () => {
    try {
      const serverCart = await apiFetch("/api/cart");
      setItems(mapServerCart(serverCart));
    } catch (err) {
      console.error("خطا در دریافت سبد خرید از سرور:", err);
    }
  }, []);

  useEffect(() => {
    refetchCart().finally(() => setIsHydrated(true));
  }, [refetchCart]);

  const addItem = useCallback(async (product, variant, options = {}) => {
    const updatedCart = await apiFetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId: product.id,
        variantId: variant.id,
      }),
    });

    const mapped = mapServerCart(updatedCart);
    setItems(mapped);

    const added = mapped.find((it) => it.variantId === variant.id) || mapped[mapped.length - 1];
    setLastAddedItem(added);
    return added;
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    const updatedCart = await apiFetch(`/api/cart/items/${cartItemId}`, { method: "DELETE" });
    setItems(mapServerCart(updatedCart));
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await apiFetch("/api/cart", { method: "DELETE" });
    } catch (err) {
      console.error("خطا در خالی‌کردن سبد خرید:", err);
    }
    setItems([]);
  }, []);

  const totalCount = items.length;

  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      addItem,
      removeItem,
      clearCart,
      refetchCart,
      totalCount,
      totalPrice,
      lastAddedItem,
      setLastAddedItem,
    }),
    [items, isHydrated, addItem, removeItem, clearCart, refetchCart, totalCount, totalPrice, lastAddedItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart باید داخل CartProvider استفاده شود.");
  }
  return ctx;
}