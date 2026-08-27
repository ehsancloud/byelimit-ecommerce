// src/app/checkout/failed/page.js
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowRight, Headphones } from "lucide-react";

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailedInner />
    </Suspense>
  );
}

function CheckoutFailedInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") || "BL-98421";

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-10 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-[#ff4757] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
          <AlertTriangle className="w-10 h-10 text-white stroke-[2.5]" />
        </div>

        <div>
          <span className="bg-rose-200 border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black">
            پرداخت ناموفق بود
          </span>
          <h1 className="text-2xl font-black mt-3">تکمیل تراکنش با خطا مواجه شد</h1>
          <p className="text-xs md:text-sm font-bold text-gray-600 mt-2 leading-relaxed">
            پرداخت برای فاکتور <span className="font-black text-black dir-ltr">{orderId}</span> انجام نشد یا توسط شما لغو گردید. هیچ مبلغی از حساب شما کسر نشده است.
          </p>
        </div>

        <div className="w-full bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl text-xs font-bold text-right flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-gray-500">شماره فاکتور محفوظ‌شده:</span>
            <span className="font-black dir-ltr">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">وضعیت فاکتور:</span>
            <span className="font-black text-rose-600">در انتظار پرداخت</span>
          </div>
        </div>

        {/*
          TODO(backend): در معماری واقعی، این دکمه باید همان سفارش/Authority ذخیره‌شده
          را دوباره به درگاه بفرستد (نه اینکه از صفر شروع کند). فعلاً کاربر را به
          سبد خرید برمی‌گرداند - اگر سبدش هنوز پاک نشده باشد (که در تلاش ناموفق نباید
          پاک شود)، می‌تواند مستقیماً به چک‌اوت ادامه دهد.
        */}
        <button
          onClick={() => router.push("/cart")}
          className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-3.5 font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
        >
          <RefreshCw className="w-5 h-5 stroke-[2.5]" />
          <span>بازگشت به سبد خرید و تلاش مجدد</span>
        </button>

        <div className="flex items-center gap-4 w-full">
          <a
            href="https://t.me/byelimit_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white hover:bg-gray-100 border-[2.5px] border-black py-2.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 text-black no-underline"
          >
            <Headphones className="w-4 h-4" />
            <span>ارتباط با پشتیبانی</span>
          </a>

          <Link
            href="/products"
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-[2.5px] border-black py-2.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 text-black no-underline"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            <span>فروشگاه محصولات</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
