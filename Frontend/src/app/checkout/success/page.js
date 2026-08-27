// src/app/checkout/success/page.js
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Clock,
  Loader2,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { apiFetch } from "../../../lib/apiClient";

// TODO: نام کاربری ربات تلگرام واقعی جایگزین شود.
// این یک دیپ‌لینک استاندارد تلگرام است: با باز شدن، پیام "/start order_<orderNumber>"
// به‌صورت خودکار برای ربات ارسال می‌شود و ربات می‌تواند بلافاصله سفارش را در دیتابیس
// پیدا کرده و روند تحویل را با پشتیبانی هماهنگ کند - بدون نیاز به تایپ دستی شماره سفارش.
const SUPPORT_BOT_USERNAME = "byelimit_support_bot";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const { refetchCart } = useCart();

  const orderNumber = searchParams.get("orderId") || "";
  const mobile = searchParams.get("mobile") || "";

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    // سبد خرید کاربر در بک‌اند پس از ثبت سفارش خودکار به وضعیت CONVERTED رفته -
    // این‌جا فقط state محلی سبد را با واقعیت سرور (سبد جدید و خالی) هماهنگ می‌کنیم.
    refetchCart();
  }, [refetchCart]);

  useEffect(() => {
    if (!orderNumber || !mobile) {
      setIsLoading(false);
      setLoadError("اطلاعات سفارش در آدرس یافت نشد.");
      return;
    }
    apiFetch(`/api/orders/${orderNumber}?mobile=${encodeURIComponent(mobile)}`)
      .then((data) => setOrder(data))
      .catch((err) => setLoadError(err.message || "خطا در دریافت اطلاعات سفارش."))
      .finally(() => setIsLoading(false));
  }, [orderNumber, mobile]);

  const telegramDeepLink = `https://t.me/${SUPPORT_BOT_USERNAME}?start=order_${orderNumber}`;
  const totalToman = order ? Math.round(Number(order.totalRial) / 10) : 0;

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-10 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] text-center flex flex-col items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-[#12e2a3] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
          </div>

          <div>
            <span className="bg-[#ccff00] border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              پرداخت با موفقیت انجام شد
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">سفارش شما نهایی و ثبت گردید</h1>
            {mobile && (
              <p className="text-xs md:text-sm font-bold text-gray-600 mt-1">
                حساب کاربری شما با شماره <span className="text-black font-black">{mobile}</span> به‌صورت خودکار ایجاد/بروزرسانی شد.
              </p>
            )}
          </div>

          {/* شماره سفارش رسمی برای پیگیری */}
          <div className="w-full bg-[#fff9c4] border-[3px] border-black rounded-2xl p-5 shadow-[-5px_5px_0_0_rgba(0,0,0,1)] flex flex-col items-center gap-2">
            <span className="text-xs font-black text-gray-700">شماره سفارش شما (برای پیگیری در پنل کاربری):</span>
            <span className="text-lg md:text-xl font-black dir-ltr tracking-wide text-black break-all">
              {orderNumber || "—"}
            </span>
            <p className="text-[11px] font-bold text-gray-600 text-center">
              این شماره در پنل کاربری شما (با همین شماره موبایل) ثبت شده و هر زمان قابل پیگیری است.
            </p>
          </div>

          {/* دریافت اکانت از طریق پشتیبانی تلگرام */}
          <div className="w-full bg-[#e0f2fe] border-[2.5px] border-black rounded-2xl p-5 text-right flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white border-[2px] border-black rounded-xl shrink-0">
                <Send className="w-6 h-6 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm">دریافت اکانت از پشتیبانی تلگرام</h4>
                <p className="text-xs font-bold text-gray-700">
                  با کلیک روی دکمه زیر مستقیم به ربات پشتیبانی وصل می‌شوید و شماره سفارش شما خودکار برای تیم تحویل ارسال می‌شود.
                </p>
              </div>
            </div>

            <a
              href={telegramDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-gray-100 border-[2px] border-black px-5 py-3 rounded-xl font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5"
            >
              <span>ورود به تلگرام و دریافت اکانت</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>ساعات پاسخگویی و تحویل: هرروز ۱۰ تا ۲۲ - در صورت عدم پاسخ سریع، با همین شماره سفارش با ما در تماس باشید.</span>
            </div>
          </div>

          {/* جزئیات فاکتور - از دیتابیس واقعی خوانده می‌شود */}
          {isLoading ? (
            <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال دریافت جزئیات فاکتور...</span>
            </div>
          ) : loadError ? (
            <p className="text-xs font-bold text-rose-600">{loadError}</p>
          ) : (
            <div className="w-full border-t-[2px] border-black pt-4 flex flex-wrap justify-between text-xs font-bold text-gray-600 gap-2">
              <div>شماره فاکتور: <span className="font-black text-black dir-ltr break-all">{orderNumber}</span></div>
              <div>مبلغ پرداختی: <span className="font-black text-black">{totalToman.toLocaleString("fa-IR")} تومان</span></div>
              <div>وضعیت: <span className="font-black text-emerald-700">{order?.status === "PAID" ? "پرداخت شده" : order?.status || "—"}</span></div>
            </div>
          )}

          <div className="w-full bg-gray-50 border-[2px] border-black rounded-xl p-3 flex items-center gap-2.5 text-[11px] font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>در صورت هرگونه مشکل در تحویل، با ارائه همین شماره سفارش، مبلغ پرداختی طبق ضمانت بازگشت وجه بررسی و مسترد می‌شود.</span>
          </div>

          <Link
            href="/dashboard/orders"
            className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-4 font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 text-black no-underline"
          >
            <User className="w-5 h-5 stroke-[2.5]" />
            <span>مشاهده و پیگیری این سفارش در پنل کاربری</span>
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </main>
  );
}
