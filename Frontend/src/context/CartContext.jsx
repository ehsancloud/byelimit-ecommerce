// Frontend/src/context/CartContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "../lib/apiClient";
import { useAuth } from "./AuthContext";

const DEFAULT_CART_CTX = {
  items: [],
  totalCount: 0,
  totalPrice: 0,
  loading: true,
  isHydrated: false,
  lastAddedItem: null,
  addItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refetchCart: async () => {},
  setLastAddedItem: () => {},
};

const CartContext = createContext(DEFAULT_CART_CTX);

function mapServerCart(serverCart) {
  if (!serverCart || !serverCart.items) return [];
  return serverCart.items.map((it) => ({
    cartItemId: it.id,
    productSlug: it.productSlug,
    productTitle: it.productTitle,
    productImage: it.productImage,
    variantId: it.variantId,
    variantName: it.variantName,
    hasSecureAddon: Boolean(it.hasSecureAddon),
    addonPriceToman: it.addonPriceToman || 0,
    unitPrice: typeof it.unitPriceToman === "number"
      ? it.unitPriceToman
      : Math.round(Number(it.unitPriceRial) / 10),
    quantity: 1,
  }));
}

export function CartProvider({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
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
  }, [refetchCart, user?.id]);

  // تخلیه خودکار حافظه سبد در فرانت‌اند هنگام تکمیل پرداخت
  useEffect(() => {
    if (pathname && pathname.includes("/checkout/success")) {
      setItems([]);
      refetchCart();
    }
  }, [pathname, refetchCart]);

  const addItem = useCallback(async (product, variant, options = {}) => {
    try {
      const updatedCart = await apiFetch("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          variantId: variant.id,
          hasSecureAddon: Boolean(options.hasSecureAddon),
          addonPriceToman: options.addonPriceToman || 0,
        }),
      });

      const mapped = mapServerCart(updatedCart);
      setItems(mapped);

      const added = mapped.find(
        (it) => it.variantId === variant.id && it.hasSecureAddon === Boolean(options.hasSecureAddon)
      ) || mapped[mapped.length - 1];

      setLastAddedItem(added);
      return added;
    } catch (err) {
      console.error("خطا در افزودن آیتم:", err);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    try {
      const updatedCart = await apiFetch(`/api/cart/items/${cartItemId}`, { method: "DELETE" });
      setItems(mapServerCart(updatedCart));
    } catch (err) {
      console.error("خطا در حذف آیتم:", err);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await apiFetch("/api/cart", { method: "DELETE" });
      setItems([]);
    } catch (err) {
      console.error("خطا در خالی‌کردن سبد خرید:", err);
      throw err;
    }
  }, []);

  const totalCount = items.length;
  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      totalCount,
      totalPrice,
      lastAddedItem,
      setLastAddedItem,
      addItem,
      removeItem,
      clearCart,
      refetchCart,
    }),
    [items, isHydrated, totalCount, totalPrice, lastAddedItem, addItem, removeItem, clearCart, refetchCart]
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