// src/components/cart/CartIcon.jsx
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

/**
 * آیکون سبد خرید برای استفاده در هدر.
 * variant="desktop"  -> جایگزین دکمه‌ی «تماس با ما» در Navbar دسکتاپ
 * variant="mobile"   -> جایگزین دکمه‌ی «برگشت» در هدر موبایل
 */
export default function CartIcon({ variant = "desktop" }) {
  const { totalCount } = useCart();

  if (variant === "mobile") {
    return (
      <Link
        href="/cart"
        className="flex items-center gap-1 bg-[#ff8f1f] border-[2.5px] border-black rounded-lg px-2.5 py-1.5 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all text-[10px] font-black z-10 relative"
        aria-label="سبد خرید"
      >
        <ShoppingCart className="w-4 h-4 stroke-[3]" />
        <span>سبد خرید</span>
        {totalCount > 0 && (
          <span className="absolute -top-2 -left-2 bg-[#ff4757] text-white border-[1.5px] border-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
            {totalCount > 9 ? "۹+" : totalCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 px-6 border-l-[3.5px] border-black font-black text-base bg-white hover:bg-gray-100 transition-colors no-underline text-black"
      aria-label="سبد خرید"
    >
      <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
      <span>سبد خرید</span>
      {totalCount > 0 && (
        <span className="absolute top-2.5 left-3 bg-[#ff4757] text-white border-[1.5px] border-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-black">
          {totalCount > 9 ? "۹+" : totalCount}
        </span>
      )}
    </Link>
  );
}
