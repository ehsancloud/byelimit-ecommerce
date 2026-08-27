// src/components/home/HeroBento.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowLeft,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Bot,
  Layers,
} from "lucide-react";

export default function HeroBento() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="mt-2 dir-rtl">
      {/* شبکه Bento Grid با ۷ کارت مجزا (کاملاً ریسپانسیو) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 auto-rows-[160px] md:auto-rows-[180px]">
        {/* ================= کارت ۱ (عریض - ۸ ستون): بنر اصلی ChatGPT Plus ================= */}
        <div className="sm:col-span-2 md:col-span-8 row-span-2 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)] group p-6 md:p-8 flex flex-col justify-end">
          <Image
            src="/images/gpt2.jpeg"
            alt="ChatGPT Plus"
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* هاله مشکی چندلایه جهت قرائت بهتر تیتر و دکمه */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-10" />

          <div className="relative z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#ff4757] text-white border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
                پرفروش‌ترین ماه
              </span>
              <span className="bg-[#ccff00] text-black border-[1.5px] border-black px-2.5 py-1 rounded-md text-xs font-black">
                تحویل ۵ دقیقه‌ای
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              اشتراک اختصاصی{" "}
              <span className="text-[#ccff00]">ChatGPT Plus</span>
            </h1>

            <p className="text-xs md:text-sm font-bold text-gray-200 mb-5 max-w-lg leading-relaxed">
              دسترسی نامحدود به قدرتمندترین مدل هوش مصنوعی دنیا (GPT-4o) با
              پشتیبانی اختصاصی و ضمانت تعویض.
            </p>

            <Link
              href="/products/chatgpt"
              className="inline-flex items-center gap-2 bg-[#12e2a3] hover:bg-[#0fd196] border-[3px] border-black px-6 py-3 rounded-xl font-black text-sm text-black shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all no-underline"
            >
              <span>مشاهده گزینه‌ها و خرید</span>
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* ================= کارت ۲ (۴ ستون): سرچ‌بار هوشمند داخل Bento ================= */}
        <div className="sm:col-span-2 md:col-span-4 row-span-1 bg-[#ccff00] border-[3.5px] border-black rounded-[24px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 font-black text-sm text-black mb-2">
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>جستجوی زنده ابزارها</span>
          </div>

          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثال: Midjourney, Claude..."
              className="w-full bg-white border-[2.5px] border-black rounded-xl py-3 pr-4 pl-10 text-xs font-black text-black outline-none focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 placeholder:font-bold"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#12e2a3] border-[1.5px] border-black rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          <span className="text-[10px] font-bold text-gray-800">
            جستجو بین بیش از ۵۰ اکانت پرمیوم هوش مصنوعی
          </span>
        </div>

        {/* ================= کارت ۳ (۴ ستون): Midjourney v6 ================= */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] group p-5 flex flex-col justify-between">
          <Image
            src="/images/midjourney.png"
            alt="Midjourney"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

          <div className="relative z-20 flex items-center justify-between w-full">
            <span className="bg-[#ff8f1f] text-black border border-black px-2 py-0.5 rounded text-[10px] font-black">
              هنر و تصویر
            </span>
            <Sparkles className="w-5 h-5 text-[#ccff00]" />
          </div>

          <div className="relative z-20 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Midjourney v6</h3>
              <p className="text-[11px] font-bold text-gray-300">
                طراحی پوستر و عکس
              </p>
            </div>
            <Link
              href="/products/midjourney"
              className="bg-[#ccff00] hover:bg-[#b5e600] border-[2px] border-black p-2 rounded-xl text-black no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* ================= کارت ۴ (۴ ستون): Claude 3.5 Sonnet ================= */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] group p-5 flex flex-col justify-between">
          <Image
            src="/images/claude.png"
            alt="Claude Pro"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

          <div className="relative z-20 flex items-center justify-between">
            <span className="bg-purple-300 text-black border border-black px-2 py-0.5 rounded text-[10px] font-black">
              برنامه‌نویسی
            </span>
            <Bot className="w-5 h-5 text-purple-300" />
          </div>

          <div className="relative z-20 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Claude Pro</h3>
              <p className="text-[11px] font-bold text-gray-300">
                بهترین مدل کدنویسی
              </p>
            </div>
            <Link
              href="/products/claude"
              className="bg-white border-[2px] border-black p-2 rounded-xl text-black no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* ================= کارت ۵ (۴ ستون): سرور مجازی (VPS) ================= */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 bg-[#12e2a3] border-[3.5px] border-black rounded-[24px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="bg-white text-black border border-black px-2 py-0.5 rounded text-[10px] font-black">
              آی‌پی ثابت
            </span>
            <Zap className="w-5 h-5 text-black stroke-[2.5]" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-black">
                سرور مجازی (VPS)
              </h3>
              <p className="text-[11px] font-bold text-gray-800 mt-0.5">
                مناسب ترید و AI
              </p>
            </div>
            <Link
              href="/products?vps=germany"
              className="bg-black text-white border-[2px] border-black p-2 rounded-xl no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* ================= کارت ۷ (۴ ستون): Cursor AI / Copilot ================= */}
        <div className="sm:col-span-2 md:col-span-4 row-span-1 bg-[#ff8f1f] border-[3.5px] border-black rounded-[24px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <div className="inline-block bg-black text-white text-[10px] font-black px-2 py-0.5 rounded mb-1">
              ویژه توسعه‌دهندگان
            </div>
            <h3 className="text-lg font-black text-black">Cursor & Copilot</h3>
            <p className="text-[11px] font-bold text-gray-900 mt-0.5">
              دستیار هوشمند برنامه‌نویسان
            </p>
          </div>

          <Link
            href="/products/copilot"
            className="bg-white border-[2.5px] border-black px-4 py-2 rounded-xl text-xs font-black text-black no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all shrink-0"
          >
            خرید آنلاین
          </Link>
        </div>
      </div>
    </section>
  );
}
