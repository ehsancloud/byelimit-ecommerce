// src/app/dashboard/orders/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Sparkles,
  Send,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

// دیتای موقت خریدهای وابسته به شماره موبایل کاربر
const USER_ORDERS = [
  {
    id: "BL-98421",
    deliveryCode: "DLV-883921",
    productTitle: "اکانت اختصاصی ChatGPT Plus",
    variantName: "پلن اختصاصی ۱۰۰٪ شخصی (۱ ماهه)",
    image: "/images/gpt2.jpeg",
    price: "۱,۲۵۰,۰۰۰ تومان",
    date: "۲۳ مرداد ۱۴۰۵",
    status: "ACTIVE", // ACTIVE | EXPIRED
    accountDetails: "Email: byelimit_user98421@gmail.com\nPass: ByeLimitPass2026!",
  },
  {
    id: "BL-77102",
    deliveryCode: "DLV-442109",
    productTitle: "اکانت Midjourney Standard",
    variantName: "پلن استاندارد (۱ ماهه)",
    image: "/images/midjourney.png",
    price: "۱,۴۵۰,۰۰۰ تومان",
    date: "۱۰ تیر ۱۴۰۵",
    status: "EXPIRED",
    accountDetails: "Email: mid_user77@gmail.com\nPass: ExpiredPass2026",
  },
];

export default function DashboardOrdersPage() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black">سفارش‌ها و کدهای تحویل من</h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            مشاهده اطلاعات تحویل آنی، کدهای اختصاصی و تمدید اشتراک‌ها.
          </p>
        </div>
        <span className="bg-[#ccff00] border-[2px] border-black px-3 py-1 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
          {USER_ORDERS.length} سفارش ثبت‌شده
        </span>
      </div>

      {/* لیست کارت‌های سفارشات */}
      <div className="flex flex-col gap-6">
        {USER_ORDERS.map((order) => (
          <div
            key={order.id}
            className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-5"
          >
            {/* هدر کارت سفارش */}
            <div className="flex flex-wrap items-center justify-between border-b-[2.5px] border-black pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm dir-ltr">{order.id}</span>
                <span className="text-gray-400">•</span>
                <span className="text-xs font-bold text-gray-600">{order.date}</span>
              </div>

              {order.status === "ACTIVE" ? (
                <span className="bg-[#12e2a3] border-[1.5px] border-black px-2.5 py-0.5 rounded-lg text-xs font-black text-black">
                  اشتراک فعال
                </span>
              ) : (
                <span className="bg-rose-200 border-[1.5px] border-black px-2.5 py-0.5 rounded-lg text-xs font-black text-rose-800">
                  منقضی شده
                </span>
              )}
            </div>

            {/* بدنه سفارش */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 flex items-center gap-3">
                <div className="relative w-16 h-16 border-[2px] border-black rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image src={order.image} alt={order.productTitle} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-sm md:text-base">{order.productTitle}</h3>
                  <p className="text-xs font-bold text-gray-600 mt-0.5">{order.variantName}</p>
                  <span className="font-black text-xs text-black block mt-1">{order.price}</span>
                </div>
              </div>

              {/* باکس کد تحویل اختصاصی */}
              <div className="md:col-span-5 bg-[#fff9c4] border-[2.5px] border-black p-3.5 rounded-xl flex items-center justify-between shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
                <div>
                  <span className="text-[10px] font-black text-gray-600 block">کد تحویل تلگرام:</span>
                  <span className="text-lg font-black dir-ltr text-black">{order.deliveryCode}</span>
                </div>

                <button
                  onClick={() => handleCopy(order.deliveryCode, order.deliveryCode)}
                  className="bg-white border-[1.5px] border-black p-2 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  {copiedId === order.deliveryCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* باکس اطلاعات تحویل آنی اکانت */}
            <div className="bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>اطلاعات اکانت تحویلی:</span>
                </span>

                <button
                  onClick={() => handleCopy(order.accountDetails, order.id)}
                  className="bg-[#12e2a3] border-[1.5px] border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === order.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === order.id ? "کپی شد" : "کپی اطلاعات"}</span>
                </button>
              </div>

              <pre className="font-mono text-xs font-bold dir-ltr text-left bg-white border border-gray-300 p-3 rounded-lg overflow-x-auto">
                {order.accountDetails}
              </pre>
            </div>

            {/* اکشن‌های پایین کارت */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#e0f2fe] border-[2px] border-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] text-black no-underline hover:bg-blue-100"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>دریافت سریع از ربات تلگرام</span>
              </a>

              {order.status === "EXPIRED" && (
                <button className="bg-[#ccff00] border-[2px] border-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تمدید مجدد این اشتراک</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}