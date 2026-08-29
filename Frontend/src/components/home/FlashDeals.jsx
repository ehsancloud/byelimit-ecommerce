"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Timer, ShoppingBag, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";

// تابع کمکی برای محاسبه زمان باقی‌مانده
function calcTimeLeft(endsAt) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    hours:   Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n) {
  return n < 10 ? `0${n}` : String(n);
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [mounted, setMounted] = useState(false);

  // ✅ دریافت پیشنهادات ویژه از بک‌اند (قابل تنظیم از Prisma Studio)
  useEffect(() => {
    setMounted(true);
    apiFetch("/api/flash-deals")
      .then((data) => setDeals(Array.isArray(data) ? data : []))
      .catch(() => setDeals([]))
      .finally(() => setIsLoading(false));
  }, []);

  // تایمر برای deal فعلی
  useEffect(() => {
    const currentDeal = deals[currentIndex];
    if (!currentDeal?.endsAt) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(calcTimeLeft(currentDeal.endsAt));

    const interval = setInterval(() => {
      const tl = calcTimeLeft(currentDeal.endsAt);
      setTimeLeft(tl);
      if (!tl) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deals, currentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? deals.length - 1 : i - 1));
  }, [deals.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i === deals.length - 1 ? 0 : i + 1));
  }, [deals.length]);

  // Auto-slide هر ۵ ثانیه
  useEffect(() => {
    if (deals.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [deals.length, next]);

  if (!mounted || isLoading) return null;
  if (deals.length === 0) return null;

  const deal = deals[currentIndex];
  const { product, dealVariant } = deal;

  return (
    <section className="bg-rose-500 border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
      {/* پترن پس‌زمینه */}
      <div className="absolute inset-0 bg-[url('/images/pattern-noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* اطلاعات پیشنهاد */}
        <div className="flex-1 text-center md:text-right text-white">
          <div className="inline-flex items-center gap-2 bg-black border-[2px] border-white px-3 py-1 rounded-lg text-xs font-black mb-4">
            <Timer className="w-4 h-4 text-[#ccff00]" />
            <span>پیشنهاد ویژه</span>
            {deals.length > 1 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                {currentIndex + 1}/{deals.length}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight">
            {product.title}
          </h2>
          <p className="text-sm md:text-base font-bold text-rose-100 mb-6 max-w-md mx-auto md:mx-0">
            {dealVariant.discountPercent}٪ تخفیف اختصاصی روی پلن {dealVariant.name}
          </p>

          {/* ✅ تایمر شمارش معکوس واقعی از endsAt که در Prisma Studio ست می‌شود */}
          {timeLeft && (
            <div className="flex items-center justify-center md:justify-start gap-3 dir-ltr mb-6">
              {[
                { value: pad(timeLeft.hours),   label: "ساعت"  },
                { value: pad(timeLeft.minutes), label: "دقیقه" },
                { value: pad(timeLeft.seconds), label: "ثانیه" },
              ].map(({ value, label }, i, arr) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black font-black text-xl md:text-2xl border-[3px] border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                      {value}
                    </span>
                    <span className="text-[10px] font-black mt-1">{label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-2xl font-black mb-4">:</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* دکمه‌های ناوبری کروسل */}
          {deals.length > 1 && (
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <button
                onClick={prev}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 border-2 border-white rounded-xl flex items-center justify-center transition-colors"
                aria-label="قبلی"
              >
                <ChevronRight className="w-5 h-5 text-white stroke-[2.5]" />
              </button>

              {/* نقطه‌های کروسل */}
              <div className="flex gap-1.5">
                {deals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full border border-white transition-all ${
                      i === currentIndex ? "bg-white w-5" : "bg-white/40"
                    }`}
                    aria-label={`پیشنهاد ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 border-2 border-white rounded-xl flex items-center justify-center transition-colors"
                aria-label="بعدی"
              >
                <ChevronLeft className="w-5 h-5 text-white stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* کارت محصول */}
        <div className="relative z-10 bg-white border-[3.5px] border-black rounded-[20px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col items-center w-full max-w-xs shrink-0">
          <div className="relative w-full h-36 bg-gray-100 border-[2px] border-black rounded-xl overflow-hidden mb-4">
            <Image
              src={product.mainImage || "/images/logo.png"}
              alt={product.title}
              fill
              className="object-cover"
            />
            <span className="absolute top-2 left-2 bg-[#ff4757] text-white font-black text-xs px-2 py-1 rounded border border-black">
              -{dealVariant.discountPercent}٪
            </span>
          </div>

          <div className="text-center w-full mb-4">
            <span className="line-through text-gray-400 font-bold text-xs block mb-1">
              {Number(dealVariant.originalPrice).toLocaleString("fa-IR")} تومان
            </span>
            <span className="text-2xl font-black text-black block">
              {Number(dealVariant.price).toLocaleString("fa-IR")} تومان
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
      </div>
    </section>
  );
}
