// Frontend/src/app/cart/page.js
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { items, isHydrated, removeItem, totalPrice, totalCount, refetchCart } = useCart();

  // همگام‌سازی قطعی قیمت‌ها با سرور به محض ورود به صفحه سبد خرید
  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  const isEmpty = isHydrated && items.length === 0;

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b-[3.5px] border-black pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
            <h1 className="text-xl md:text-2xl font-black">سبد خرید شما</h1>
            {totalCount > 0 && (
              <span className="bg-[#12e2a3] border-[1.5px] border-black px-2 py-0.5 rounded-md text-xs font-black">
                {totalCount} کالا
              </span>
            )}
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 bg-white border-[2.5px] border-black px-3 py-1.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 transition-all"
          >
            <ArrowRight className="w-4 h-4 stroke-[3]" />
            <span>ادامه خرید</span>
          </Link>
        </div>

        {/* نشانگر زنده بودن قیمت‌ها بر اساس دلار */}
        <div className="bg-[#ccff00] border-[2.5px] border-black p-3 rounded-2xl flex items-center justify-between shadow-[-4px_4px_0_0_rgba(0,0,0,1)] mb-6 text-xs font-black">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-black" />
            <span>قیمت‌های سبد خرید به‌صورت لحظه‌ای با نوسانات نرخ ارز و دلار همگام‌سازی می‌شوند.</span>
          </div>
          <span className="hidden sm:inline bg-black text-white px-2 py-0.5 rounded text-[10px]">نرخ زنده</span>
        </div>

        {isEmpty ? (
          <div className="bg-white border-[3.5px] border-black rounded-[24px] p-10 text-center flex flex-col items-center gap-4 shadow-[-8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-[#f3f3f3] border-[2.5px] border-black rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="font-black text-lg">سبد خرید شما خالی است</h2>
            <p className="text-xs font-bold text-gray-600">
              هنوز محصولی به سبد خریدتان اضافه نکرده‌اید.
            </p>
            <Link
              href="/products"
              className="bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl px-6 py-3 font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-4">
              {items.map((it) => (
                <div
                  key={it.cartItemId}
                  className="bg-white border-[3px] border-black rounded-2xl p-4 flex items-center gap-4 shadow-[-5px_5px_0_0_rgba(0,0,0,1)]"
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 border-[2px] border-black rounded-xl overflow-hidden bg-[#f8f9fa] shrink-0">
                    <Image
                      src={it.productImage}
                      alt={it.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm truncate">
                      {it.productTitle}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                      {it.variantName}
                    </p>

                    <div className="mt-3">
                      <span className="font-black text-sm text-emerald-700">
                        {it.unitPrice.toLocaleString("fa-IR")}{" "}
                        <span className="text-[10px] font-bold text-gray-700">تومان</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(it.cartItemId)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border-[1.5px] border-black rounded-lg shrink-0 cursor-pointer"
                    aria-label="حذف از سبد"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4">
                <h3 className="font-black text-base border-b-[2.5px] border-black pb-3">
                  خلاصه سبد خرید
                </h3>

                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>جمع {totalCount} کالا:</span>
                  <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t-[2px] border-black font-black text-sm">
                  <span>مبلغ قابل پرداخت:</span>
                  <div className="text-left">
                    <span className="text-xl text-emerald-600">
                      {totalPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs mr-1">تومان</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-4 font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>ثبت نهایی و پرداخت</span>
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="bg-[#fff9c4] border-[2.5px] border-black p-4 rounded-xl flex flex-col gap-2 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] text-xs font-bold">
                <div className="flex items-center gap-2 font-black text-black">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                  <span>ضمانت ۱۰۰٪ تحویل و کارکرد</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>تحویل سریع در ساعات پشتیبانی: هرروز ۱۰ تا ۲۲</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}