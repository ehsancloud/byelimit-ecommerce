// src/components/products/StickyMobileBar.jsx
"use client";

import { ShoppingBag, Tag, Clock } from "lucide-react";

export default function StickyMobileBar({
  selectedVariant,
  appliedDiscount,
  finalUnitPrice,
  onAddToCart,
  isAddingToCart,
}) {
  const isPriceTBD = Boolean(selectedVariant.priceTBD) || selectedVariant.price == null;
  const isDisabled = isPriceTBD || isAddingToCart;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-[3.5px] border-black p-3 md:hidden flex items-center justify-between gap-3 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
      <div>
        <span className="text-[10px] font-bold text-gray-500 block">
          {selectedVariant.name}
        </span>
        {isPriceTBD ? (
          <div className="flex items-center gap-1 text-xs font-black text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span>قیمت به‌زودی</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-black">
              {finalUnitPrice.toLocaleString("fa-IR")}{" "}
              <span className="text-[10px]">تومان</span>
            </span>
            {appliedDiscount && (
              <span className="flex items-center gap-0.5 bg-[#ccff00] border border-black text-[9px] font-black px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" />
                {appliedDiscount.code}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={isDisabled}
        className={`flex-1 py-3 px-4 rounded-xl border-[2.5px] border-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] ${
          isDisabled
            ? "bg-gray-200 cursor-not-allowed opacity-70"
            : "cursor-pointer bg-[#ccff00] text-black active:shadow-none"
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        <span>{isPriceTBD ? "به‌زودی" : isAddingToCart ? "..." : "ثبت سفارش"}</span>
      </button>
    </div>
  );
}
