// src/app/dashboard/page.js
"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Ticket,
  Wallet,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* پیام خوش‌آمدگویی */}
      <div className="bg-[#ccff00] border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white border border-black px-2.5 py-0.5 rounded text-xs font-black mb-1 inline-block">
            پنل کاربری خریدار
          </span>
          <h1 className="text-xl md:text-2xl font-black text-black">
            خوش آمدید، کاربر عزیز!
          </h1>
          <p className="text-xs font-bold text-gray-800 mt-1">
            از این بخش می‌توانید سفارش‌ها، کدهای تحویل و تیکت‌های خود را مدیریت کنید.
          </p>
        </div>

        <Link
          href="/products"
          className="bg-black text-white hover:bg-gray-800 border-[2.5px] border-black px-5 py-3 rounded-xl font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5 shrink-0 no-underline"
        >
          <span>خرید اکانت جدید</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* کارت‌های آماری خلاصه */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block">سفارش‌های فعال</span>
            <span className="text-2xl font-black text-black mt-1 block">۱ عدد</span>
          </div>
          <div className="p-3 bg-[#12e2a3] border-[2px] border-black rounded-xl">
            <Zap className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block">اعتبار کیف پول</span>
            <span className="text-2xl font-black text-black mt-1 block">۰ <span className="text-xs font-normal">تومان</span></span>
          </div>
          <div className="p-3 bg-[#ff8f1f] border-[2px] border-black rounded-xl">
            <Wallet className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block">تیکت‌های در جریان</span>
            <span className="text-2xl font-black text-black mt-1 block">۰ عدد</span>
          </div>
          <div className="p-3 bg-purple-200 border-[2px] border-black rounded-xl">
            <Ticket className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* آخرین سفارش فعال با دسترسی سریع به کد تحویل */}
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
          <h2 className="font-black text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>آخرین اشتراک خریداری‌شده شما</span>
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-black text-gray-600 hover:underline"
          >
            مشاهده همه سفارش‌ها
          </Link>
        </div>

        <div className="bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-sm md:text-base">اکانت اختصاصی ChatGPT Plus</h3>
            <p className="text-xs font-bold text-gray-500 mt-1">شماره سفارش: BL-98421 • تاریخ ثبت: ۲۳ مرداد ۱۴۰۵</p>
          </div>

          <div className="bg-[#fff9c4] border-[2px] border-black px-4 py-2 rounded-xl text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
            کد تحویل: <span className="dir-ltr inline-block font-mono text-sm">DLV-883921</span>
          </div>
        </div>
      </div>
    </div>
  );
}