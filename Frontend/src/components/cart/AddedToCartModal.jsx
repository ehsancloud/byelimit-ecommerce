// Frontend/src/components/cart/AddedToCartModal.jsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function AddedToCartModal({ isOpen, onClose }) {
  const router = useRouter();
  const { items, totalPrice, totalCount } = useCart();

  const handleGoToCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-[family-name:var(--font-farsi)] dir-rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-md bg-white border-[3.5px] border-black rounded-[24px] shadow-[-10px_10px_0_0_rgba(0,0,0,1)] z-10 text-right overflow-hidden"
          >
            <div className="bg-[#12e2a3] border-b-[3px] border-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border-[2px] border-black rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <h3 className="font-black text-sm md:text-base text-black">
                  به سبد خرید اضافه شد!
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-white border-[2px] border-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3 max-h-[45vh] overflow-y-auto">
              {items.map((it) => (
                <div
                  key={it.cartItemId}
                  className="flex items-center gap-3 bg-[#f8f9fa] border-[2px] border-black p-2.5 rounded-xl"
                >
                  <div className="relative w-12 h-12 border-[1.5px] border-black rounded-lg overflow-hidden bg-white shrink-0">
                    <Image
                      src={it.productImage}
                      alt={it.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs truncate">
                      {it.productTitle}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-600 truncate">
                      {it.variantName}
                    </p>
                  </div>
                  <span className="font-black text-xs whitespace-nowrap">
                    {it.unitPrice.toLocaleString("fa-IR")}{" "}
                    <span className="text-[10px] font-bold">تومان</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t-[2.5px] border-black flex flex-col gap-3">
              <div className="flex items-center justify-between font-black text-sm">
                <span>
                  جمع سبد ({totalCount} کالا):
                </span>
                <span className="text-base">
                  {totalPrice.toLocaleString("fa-IR")}{" "}
                  <span className="text-xs">تومان</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleContinueShopping}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 border-[2.5px] border-black rounded-xl py-3 font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>افزودن کالای دیگر</span>
                </button>
                <button
                  onClick={handleGoToCheckout}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#ccff00] hover:bg-[#b5e600] border-[2.5px] border-black rounded-xl py-3 font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <span>برو به پرداخت</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}