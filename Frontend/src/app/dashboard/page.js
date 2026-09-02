"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Wallet, Clock, ArrowLeft, Sparkles, Zap, Loader2, Copy, Check } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";

const STATUS_COLOR = {
  PAID:            "bg-[#12e2a3] border-black text-black",
  PENDING_PAYMENT: "bg-yellow-200 border-black text-black",
  FAILED:          "bg-rose-200 border-black text-black",
  REFUNDED:        "bg-gray-200 border-black text-black",
  CANCELLED:       "bg-gray-200 border-black text-black",
  DELIVERED:       "bg-blue-200 border-black text-black",
};

const STATUS_LABEL = {
  PAID:            "پرداخت‌شده",
  PENDING_PAYMENT: "در انتظار پرداخت",
  FAILED:          "ناموفق",
  REFUNDED:        "مسترد شده",
  CANCELLED:       "لغو‌شده",
  DELIVERED:       "تحویل‌شده",
};

export default function DashboardHomePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/auth/me").catch(() => null),
      apiFetch("/api/orders/mine").catch(() => []),
    ]).then(([meData, ordersData]) => {
      setUser(meData?.user || null);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED");
  const lastOrder = paidOrders[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* پیام خوش‌آمدگویی */}
      <div className="bg-[#ccff00] border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white border border-black px-2.5 py-0.5 rounded text-xs font-black mb-1 inline-block">
            پنل کاربری خریدار
          </span>
          <h1 className="text-xl md:text-2xl font-black text-black">
            خوش آمدید، {user?.fullName || user?.mobile || "کاربر عزیز"}!
          </h1>
          <p className="text-xs font-bold text-gray-800 mt-1">
            از این بخش می‌توانید سفارش‌ها و کدهای تحویل خود را مدیریت کنید.
          </p>
        </div>
        <Link href="/products"
          className="bg-black text-white hover:bg-gray-800 border-[2.5px] border-black px-5 py-3 rounded-xl font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5 shrink-0 no-underline"
        >
          <span>خرید اکانت جدید</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block">اشتراک‌های فعال</span>
            <span className="text-2xl font-black text-black mt-1 block">
              {paidOrders.length.toLocaleString("fa-IR")} عدد
            </span>
          </div>
          <div className="p-3 bg-[#12e2a3] border-[2px] border-black rounded-xl">
            <Zap className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block">مجموع سفارشات (نهایی‌شده)</span>
            <span className="text-2xl font-black text-black mt-1 block">
              {paidOrders.length.toLocaleString("fa-IR")} عدد
            </span>
          </div>
          <div className="p-3 bg-[#ff8f1f] border-[2px] border-black rounded-xl">
            <ShoppingBag className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* آخرین سفارش */}
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
          <h2 className="font-black text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>آخرین سفارش</span>
          </h2>
          <Link href="/dashboard/orders" className="text-xs font-black text-gray-600 hover:underline">
            مشاهده همه سفارش‌ها
          </Link>
        </div>

        {lastOrder ? (
          <div className="flex flex-col gap-3">
            <div className="bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                {lastOrder.items.map((item, i) => (
                  <h3 key={i} className="font-black text-sm md:text-base">{item.productTitle}</h3>
                ))}
                <p className="text-xs font-bold text-gray-500 mt-1 dir-ltr text-right">
                  {lastOrder.orderNumber.slice(0, 8).toUpperCase()} •
                  {" "}{new Date(lastOrder.createdAt).toLocaleDateString("fa-IR")}
                </p>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 border-[2px] rounded-lg shrink-0 ${STATUS_COLOR[lastOrder.status] || "bg-gray-100 border-black"}`}>
                {STATUS_LABEL[lastOrder.status] || lastOrder.status}
              </span>
            </div>

            {lastOrder.status === "PAID" && lastOrder.items.some((i) => i.credentials) && (
              <div className="flex flex-col gap-2">
                {lastOrder.items.filter((i) => i.credentials).map((item, i) => (
                  <div key={i} className="bg-[#fff9c4] border-[2px] border-black px-4 py-3 rounded-xl flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-600 block mb-1">{item.productTitle}</span>
                      <pre className="dir-ltr text-right font-mono text-xs font-black whitespace-pre-wrap">{item.credentials}</pre>
                    </div>
                    <button
                      onClick={() => handleCopy(item.credentials, `${lastOrder.id}-${i}`)}
                      className="p-1.5 bg-white border-[1.5px] border-black rounded-lg hover:bg-gray-100 shrink-0"
                      aria-label="کپی"
                    >
                      {copiedId === `${lastOrder.id}-${i}` ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">هنوز سفارشی ثبت نشده است.</p>
            <Link href="/products" className="mt-3 inline-block text-xs font-black text-[#12e2a3] border-b-2 border-[#12e2a3]">
              همین حالا خرید کنید
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
