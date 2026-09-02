"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, ShoppingBag, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "../../../lib/apiClient";
import { formatPriceToman, rialToFormattedToman } from "../../../lib/formatters";

const STATUS_COLOR = {
  PAID:      "bg-[#12e2a3] border-black",
  DELIVERED: "bg-blue-200 border-black",
};
const STATUS_LABEL = {
  PAID:      "✅ پرداخت‌شده",
  DELIVERED: "📦 تحویل‌شده",
};

// ✅ FIX: فقط سفارشات تکمیل‌شده (PAID / DELIVERED) نمایش داده می‌شوند
const COMPLETED_STATUSES = ["PAID", "DELIVERED"];

export default function DashboardOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    apiFetch("/api/orders/mine")
      .then((data) => {
        const completed = (Array.isArray(data) ? data : [])
          .filter((o) => COMPLETED_STATUSES.includes(o.status));
        setOrders(completed);
      })
      .catch((err) => setError(err.message || "خطا در دریافت سفارشات."))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 border-[3px] border-black rounded-[24px] p-8 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
      <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
      <p className="font-black text-sm text-rose-700">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black">سفارش‌ها و کدهای تحویل</h1>
          <p className="text-xs font-bold text-gray-600 mt-1">اطلاعات ورود به اکانت‌های خریداری‌شده</p>
        </div>
        <span className="bg-[#ccff00] border-[2px] border-black px-3 py-1 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
          {orders.length.toLocaleString("fa-IR")} سفارش
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-[3px] border-black rounded-[24px] p-12 text-center shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-black text-base">هنوز خرید تکمیل‌شده‌ای ندارید.</p>
          <Link href="/products"
            className="mt-4 inline-block bg-[#ccff00] border-[2.5px] border-black px-6 py-2.5 rounded-xl font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] text-black no-underline"
          >رفتن به فروشگاه</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id}
              className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-5"
            >
              {/* هدر کارت */}
              <div className="flex flex-wrap items-center justify-between border-b-[2.5px] border-black pb-3 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm dir-ltr">{order.orderNumber.slice(0,8).toUpperCase()}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString("fa-IR")}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs font-bold text-gray-600">{rialToFormattedToman(order.totalRial)} تومان</span>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 border-[2px] rounded-lg ${STATUS_COLOR[order.status] || "bg-gray-100 border-black"}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>

              {/* آیتم‌ها */}
              {order.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div>
                    <h3 className="font-black text-sm md:text-base">{item.productTitle}</h3>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{item.variantName}</p>
                  </div>

                  {item.credentials ? (
                    <div className="bg-[#fff9c4] border-[2.5px] border-black p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          اطلاعات ورود به اکانت
                        </span>
                        <button onClick={() => handleCopy(item.credentials, `${order.id}-${idx}`)}
                          className="flex items-center gap-1 text-[10px] font-black bg-white border-[1.5px] border-black px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {copiedId === `${order.id}-${idx}`
                            ? <><Check className="w-3 h-3 text-emerald-600" /><span>کپی شد!</span></>
                            : <><Copy className="w-3 h-3" /><span>کپی کردن</span></>
                          }
                        </button>
                      </div>
                      <pre className="dir-ltr text-right font-mono text-xs font-black whitespace-pre-wrap text-gray-900">
                        {item.credentials}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-[2px] border-yellow-400 p-3 rounded-xl text-xs font-bold text-yellow-700 flex items-center gap-2">
                      <span>⏳</span>
                      <span>اکانت در حال تخصیص است. اگر بیشتر از ۳۰ دقیقه گذشته، از طریق <a href="https://t.me/byelimit_support" className="underline">پشتیبانی تلگرام</a> پیگیری کنید.</span>
                    </div>
                  )}
                </div>
              ))}

              {order.payment?.refId && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 border-t-[1.5px] border-gray-200 pt-3">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>شماره پیگیری: </span>
                  <span className="dir-ltr font-mono font-black text-gray-700">{order.payment.refId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
