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

  // متن خلاصه و سریع برای ارسال به پشتیبانی
  const readyMessage = `سلام، کد سفارش: ${orderNumber}
شماره: ${mobile || order?.mobile || "—"}`;

  // لینک های باز شدن مستقیم در اپلیکیشن تلگرام
  const telegramDirectUrl = `tg://resolve?domain=${SUPPORT_TELEGRAM_USERNAME}`;
  const telegramShareUrl = `tg://msg_url?url=${encodeURIComponent(readyMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(readyMessage).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const totalToman = order?.totalToman || 0;

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] text-center flex flex-col items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-[#12e2a3] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-8 h-8 text-black stroke-[2.5]" />
          </div>

          <div>
            <span className="bg-[#ccff00] border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              پرداخت با موفقیت تایید شد
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-2">سفارش شما ثبت شد</h1>
          </div>

          {/* شماره سفارش رسمی */}
          <div className="w-full bg-[#fff9c4] border-[2.5px] border-black rounded-xl p-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center gap-1">
            <span className="text-xs font-black text-gray-700">کد پیگیری سفارش شما:</span>
            <span className="text-2xl font-black dir-ltr tracking-wide text-black break-all">
              {orderNumber || "—"}
            </span>
          </div>

          {/* بخش ارتباط با اکانت پشتیبانی تلگرام */}
          <div className="w-full bg-[#e0f2fe] border-[2.5px] border-black rounded-xl p-4 text-right flex flex-col gap-3 shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white border-[1.5px] border-black rounded-lg shrink-0">
                <Send className="w-5 h-5 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm">ارتباط مستقیم با پشتیبانی تلگرام</h4>
                <p className="text-xs font-bold text-gray-600">
                  جهت دریافت اکانت، کد سفارش را به پشتیبان ارسال کنید.
                </p>
              </div>
            </div>

            {/* کادر متن پیام */}
            <div className="bg-white border-[2px] border-black rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-500">متن پیام:</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-[11px] font-black bg-gray-100 hover:bg-gray-200 border border-black px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-700" />
                      <span>کپی متن</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-bold font-[family-name:var(--font-farsi)] whitespace-pre-wrap text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200">
                {readyMessage}
              </pre>
            </div>

            {/* دکمه های تلگرام */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={telegramDirectUrl}
                onClick={handleCopyMessage}
                className="bg-white hover:bg-gray-100 border-[2px] border-black py-2.5 px-3 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 no-underline text-black cursor-pointer"
              >
                <span>چت در اپلیکیشن تلگرام</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={telegramShareUrl}
                className="bg-[#12e2a3] hover:bg-[#0fd498] border-[2px] border-black py-2.5 px-3 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 no-underline text-black cursor-pointer"
              >
                <MessageSquareShare className="w-3.5 h-3.5" />
                <span>ارسال مستقیم متن به تلگرام</span>
              </a>
            </div>
          </div>

          {/* فاکتور خلاصه سفارش */}
          {isLoading ? (
            <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال بارگذاری فاکتور...</span>
            </div>
          ) : loadError ? (
            <p className="text-xs font-bold text-rose-600">{loadError}</p>
          ) : (
            <div className="w-full border-t-[2px] border-black pt-3 flex flex-wrap justify-between text-xs font-bold text-gray-700 gap-2">
              <div>مبلغ پرداختی: <span className="font-black text-black">{totalToman.toLocaleString("fa-IR")} تومان</span></div>
              <div>وضعیت: <span className="font-black text-emerald-700">{order?.statusLabel || "پرداخت شده"}</span></div>
              {order?.payment?.refId && (
                <div>کد پیگیری درگاه: <span className="font-black text-black dir-ltr">{order.payment.refId}</span></div>
              )}
            </div>
          )}

          <Link
            href="/dashboard/orders"
            className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[2.5px] border-black rounded-xl py-3 font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 text-black no-underline"
          >
            <User className="w-4 h-4 stroke-[2.5]" />
            <span>مشاهده سفارش در پنل کاربری</span>
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </main>
  );
}