// src/components/home/FlashDeals.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Timer, ShoppingBag } from "lucide-react";
import { getProductBySlug } from "../../data/products";

// TODO(backend): زمان پایان واقعی این پیشنهاد باید از دیتابیس/پنل مدیریت خوانده شود
// (مثلاً product.dealEndsAt) نه یک تایمر کلاینتی که خودش را هر ۲۴ ساعت ریست می‌کند -
// تایمری که هیچ‌وقت واقعاً به صفر نمی‌رسد، یک الگوی فریبنده (fake urgency) است.
const FEATURED_DEAL_SLUG = "copilot";
const DEAL_END_TIME = null; // مقدار واقعی Date بعداً از بک‌اند تزریق می‌شود

export default function FlashDeals() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProductBySlug(FEATURED_DEAL_SLUG)
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .catch(() => {
        // اگر بک‌اند در دسترس نبود، این بخش صرفاً نمایش داده نمی‌شود
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const dealVariant = product?.variants.find(
    (v) => !v.priceTBD && v.price != null && v.originalPrice > v.price,
  );

  useEffect(() => {
    setMounted(true);
    if (!DEAL_END_TIME) return;

    const interval = setInterval(() => {
      const diff = new Date(DEAL_END_TIME).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // تا وقتی قیمت واقعی و تخفیف‌دار برای محصول منتخب ثبت نشده، این بخش اصلاً نمایش داده نمی‌شود
  if (!mounted || !product || !dealVariant) return null;

  const discountPercent = Math.round(
    ((dealVariant.originalPrice - dealVariant.price) / dealVariant.originalPrice) * 100,
  );

  return (
    <section className="bg-rose-500 border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
      {/* پترن پس‌زمینه */}
      <div className="absolute inset-0 bg-[url('/images/pattern-noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      {/* اطلاعات پیشنهاد شگفت‌انگیز */}
      <div className="relative z-10 flex-1 text-center md:text-right text-white">
        <div className="inline-flex items-center gap-2 bg-black border-[2px] border-white px-3 py-1 rounded-lg text-xs font-black mb-4">
          <Timer className="w-4 h-4 text-[#ccff00]" />
          <span>پیشنهاد ویژه</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight">
          {product.title}
        </h2>
        <p className="text-sm md:text-base font-bold text-rose-100 mb-6 max-w-md mx-auto md:mx-0">
          {discountPercent}٪ تخفیف اختصاصی روی پلن {dealVariant.name}.
        </p>

        {timeLeft && (
          <div className="flex items-center justify-center md:justify-start gap-3 dir-ltr">
            <div className="flex flex-col items-center">
              <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black font-black text-xl md:text-2xl border-[3px] border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
              </span>
              <span className="text-[10px] font-black mt-1">ثانیه</span>
            </div>
            <span className="text-2xl font-black mb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black font-black text-xl md:text-2xl border-[3px] border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
              </span>
              <span className="text-[10px] font-black mt-1">دقیقه</span>
            </div>
            <span className="text-2xl font-black mb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black font-black text-xl md:text-2xl border-[3px] border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}
              </span>
              <span className="text-[10px] font-black mt-1">ساعت</span>
            </div>
          </div>
        )}
      </div>

      {/* تصویر و دکمه خرید */}
      <div className="relative z-10 bg-white border-[3.5px] border-black rounded-[20px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col items-center w-full max-w-xs shrink-0">
        <div className="relative w-full h-36 bg-gray-100 border-[2px] border-black rounded-xl overflow-hidden mb-4">
          <Image src={product.mainImage} alt={product.title} fill className="object-cover" />
          <span className="absolute top-2 left-2 bg-[#ff4757] text-white font-black text-xs px-2 py-1 rounded border border-black">
            -{discountPercent}٪
          </span>
        </div>
        <div className="text-center w-full mb-4">
          <span className="line-through text-gray-400 font-bold text-xs block mb-1">
            {dealVariant.originalPrice.toLocaleString("fa-IR")} تومان
          </span>
          <span className="text-2xl font-black text-black block">
            {dealVariant.price.toLocaleString("fa-IR")} تومان
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all text-black"
        >
          <ShoppingBag className="w-4 h-4 stroke-[3]" />
          <span>مشاهده و خرید</span>
        </Link>
      </div>
    </section>
  );
}
