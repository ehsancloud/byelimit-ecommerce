// Frontend/src/app/checkout/success/page.js
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
  Copy,
  Check,
  MessageSquareShare,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { apiFetch } from "../../../lib/apiClient";

// آیدی پشتیبانی مستقیم انسانی در تلگرام
const SUPPORT_TELEGRAM_USERNAME = "byelimit_support";

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
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  useEffect(() => {
    if (!orderNumber) {
      setIsLoading(false);
      setLoadError("شماره سفارش در آدرس یافت نشد.");
      return;
    }

    const queryParam = mobile ? `?mobile=${encodeURIComponent(mobile)}` : "";
    apiFetch(`/api/orders/${orderNumber}${queryParam}`)
      .then((data) => setOrder(data))
      .catch((err) => setLoadError(err.message || "خطا در دریافت اطلاعات سفارش."))
      .finally(() => setIsLoading(false));
  }, [orderNumber, mobile]);

  // متن استاندارد و آماده برای ارسال به پشتیبانی
  const readyMessage = `سلام وقت بخیر، من سفارشم رو در سایت بای لیمیت پرداخت کردم.
کد پیگیری سفارش: ${orderNumber}
شماره همراه: ${mobile || order?.mobile || "—"}
لطفاً مشخصات و اطلاعات اکانت را ارسال بفرمایید.`;

  // لینک مستقیم چت با پشتیبانی
  const telegramDirectUrl = `https://t.me/${SUPPORT_TELEGRAM_USERNAME}`;

  // لینک اشتراک‌گذاری حاوی متن پیش‌فرض در تلگرام
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://byelimit.ir")}&text=${encodeURIComponent(readyMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(readyMessage).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const totalToman = order?.totalToman || 0;

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-10 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] text-center flex flex-col items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-[#12e2a3] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
          </div>

          <div>
            <span className="bg-[#ccff00] border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              پرداخت با موفقیت تایید شد
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">سفارش شما با موفقیت ثبت شد</h1>
            {mobile && (
              <p className="text-xs md:text-sm font-bold text-gray-600 mt-1">
                سفارش شما برای شماره <span className="text-black font-black">{mobile}</span> ثبت و ذخیره گردید.
              </p>
            )}
          </div>

          {/* شماره سفارش رسمی */}
          <div className="w-full bg-[#fff9c4] border-[3px] border-black rounded-2xl p-5 shadow-[-5px_5px_0_0_rgba(0,0,0,1)] flex flex-col items-center gap-2">
            <span className="text-xs font-black text-gray-700">کد رهگیری و شماره سفارش شما:</span>
            <span className="text-xl md:text-2xl font-black dir-ltr tracking-wide text-black break-all">
              {orderNumber || "—"}
            </span>
            <p className="text-[11px] font-bold text-gray-600 text-center">
              این سفارش هم‌اکنون در پنل کاربری شما با وضعیت پرداخت‌شده در دسترس است.
            </p>
          </div>

          {/* بخش ارتباط با اکانت پشتیبانی تلگرام */}
          <div className="w-full bg-[#e0f2fe] border-[2.5px] border-black rounded-2xl p-5 text-right flex flex-col gap-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white border-[2px] border-black rounded-xl shrink-0">
                <Send className="w-6 h-6 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm">ارتباط مستقیم با پشتیبانی تلگرام جهت دریافت اکانت</h4>
                <p className="text-xs font-bold text-gray-700">
                  جهت دریافت سریع مشخصات لاگین، کد سفارش خود را به آیدی پشتیبانی ارسال فرمایید.
                </p>
              </div>
            </div>

            {/* کادر متن آماده پیام */}
            <div className="bg-white border-[2px] border-black rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-500">متن پیام آماده ارسال به پشتیبان:</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-[11px] font-black bg-gray-100 hover:bg-gray-200 border border-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-700" />
                      <span>کپی متن پیام</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-bold font-[family-name:var(--font-farsi)] whitespace-pre-wrap text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                {readyMessage}
              </pre>
            </div>

            {/* دکمه‌های باز کردن تلگرام */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <a
                href={telegramDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopyMessage}
                className="bg-white hover:bg-gray-100 border-[2px] border-black py-3 px-4 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 no-underline text-black cursor-pointer"
              >
                <span>چت مستقیم با پشتیبان (@{SUPPORT_TELEGRAM_USERNAME})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#12e2a3] hover:bg-[#0fd498] border-[2px] border-black py-3 px-4 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 no-underline text-black cursor-pointer"
              >
                <MessageSquareShare className="w-4 h-4" />
                <span>ارسال مستقیم با متن آماده در تلگرام</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>پشتیبانی همه‌روزه فعال است؛ اکانت شما به سرعت پس از ارسال پیام ارسال می‌گردد.</span>
            </div>
          </div>

          {/* فاکتور خلاصه سفارش */}
          {isLoading ? (
            <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال بارگذاری جزئیات فاکتور...</span>
            </div>
          ) : loadError ? (
            <p className="text-xs font-bold text-rose-600">{loadError}</p>
          ) : (
            <div className="w-full border-t-[2px] border-black pt-4 flex flex-wrap justify-between text-xs font-bold text-gray-600 gap-2">
              <div>شماره فاکتور: <span className="font-black text-black dir-ltr break-all">{orderNumber}</span></div>
              <div>مبلغ پرداختی: <span className="font-black text-black">{totalToman.toLocaleString("fa-IR")} تومان</span></div>
              <div>وضعیت سفارش: <span className="font-black text-emerald-700">{order?.statusLabel || "پرداخت شده"}</span></div>
              {order?.payment?.refId && (
                <div>شماره پیگیری درگاه: <span className="font-black text-black dir-ltr">{order.payment.refId}</span></div>
              )}
            </div>
          )}

          <div className="w-full bg-gray-50 border-[2px] border-black rounded-xl p-3 flex items-center gap-2.5 text-[11px] font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ضمانت کامل فعال‌سازی و پشتیبانی بای لیمیت بر روی تمامی اکانت‌ها لحاظ شده است.</span>
          </div>

          <Link
            href="/dashboard/orders"
            className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-4 font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 text-black no-underline"
          >
            <User className="w-5 h-5 stroke-[2.5]" />
            <span>مشاهده سفارش‌ها در پنل کاربری</span>
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </main>
  );
}