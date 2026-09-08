// src/components/home/HeroBento.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Bot,
  Layers,
} from "lucide-react";

const IMAGE_FOCUS = {
  hero: "Left",
  midjourney: "center",
  claude: "center",
  gemini: "center",
};

const FOCUS_CLASS = {
  left: "object-left md:object-center",
  center: "object-center",
  right: "object-right md:object-center",
};

export default function HeroBento() {
  return (
    <section className="mt-2 dir-rtl">
      {/* ارتفاع ردیف‌ها در موبایل بیشتر شد تا کارت‌ها فشرده نشن */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 auto-rows-[220px] sm:auto-rows-[200px] md:auto-rows-[180px]">
        {/* کارت ۱ */}
        <div className="sm:col-span-2 md:col-span-8 row-span-2 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)] group p-6 md:p-8 flex flex-col justify-end">
          <Image
            src="/images/banner1.jpeg"
            alt="خرید جمنای پرو ارزان از بای لیمیت "
            fill
            priority
            className={`object-cover ${FOCUS_CLASS[IMAGE_FOCUS.hero]} group-hover:scale-105 transition-transform duration-700`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-10" />

          <div className="relative z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#ff4757] text-white border-[1.5px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
                پرفروش‌ ترین ماه
              </span>
              <span className="bg-[#ccff00] text-black border-[1.5px] border-black px-2.5 py-1 rounded-md text-xs font-black">
                تحویل سریع 
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              اشتراک اختصاصی{" "}
              <span className="text-[#ccff00]"> Gemini Pro</span>
            </h1>

            <p className="text-xs md:text-sm font-bold text-gray-200 mb-5 max-w-lg leading-relaxed">
دسترسی نامحدود به تمامی ابزار ها و مدل های Google AI Pro
            </p>

            <Link
              href="/products/gemini"
              className="inline-flex items-center gap-2 bg-[#12e2a3] hover:bg-[#0fd196] border-[3px] border-black px-6 py-3 rounded-xl font-black text-sm text-black shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all no-underline"
            >
              <span>مشاهده گزینه‌ ها و خرید</span>
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* کارت ۲ */}
        <div className="sm:col-span-2 md:col-span-4 row-span-1 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] group p-5 flex flex-col justify-between">
          <Image
            src="/images/bannercoursera.jpeg"
            alt="خرید کورسرا ارزان از بای لیمیت "
            fill
            className={`object-cover ${FOCUS_CLASS[IMAGE_FOCUS.gemini]} group-hover:scale-110 transition-transform duration-700 opacity-70`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

          <div className="relative z-20 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                 Coursera (کورسرا)
              </h3>
              <p className="text-[11px] font-bold text-gray-300">
به جای اشتراک سالیانه مکتب                   </p>
            </div>
            <Link
              href="/products/coursera"
              className="bg-[#ccff00] hover:bg-[#b5e600] border-[2px] border-black p-2 rounded-xl text-black no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* کارت ۳ */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] group p-5 flex flex-col justify-between">
          <Image
            src="/images/bannergta6.jpeg"
            alt="خرید جی تی ای 6 از بای لیمیت"
            fill
            className={`object-cover ${FOCUS_CLASS[IMAGE_FOCUS.midjourney]} group-hover:scale-110 transition-transform duration-700 opacity-70`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

          <div className="relative z-20 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-white">GTA 6 (جی تی ای 6)</h3>
              <p className="text-[11px] font-bold text-gray-300">
               زود تر از دوستات تجربش کن!
              </p>
            </div>
            <Link
              href="/products/gta6"
              className="bg-[#ccff00] hover:bg-[#b5e600] border-[2px] border-black p-2 rounded-xl text-black no-underline shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* کارت ۴ */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 relative bg-black border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] group p-5 flex flex-col justify-between">
          <Image
            src="/images/bannerclaude.jpeg"
            alt="خرید کلاد پرو از بای لیمیت "
            fill
            className={`object-cover ${FOCUS_CLASS[IMAGE_FOCUS.claude]} group-hover:scale-110 transition-transform duration-700 opacity-60`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />


          <div className="relative z-20 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Claude Pro</h3>
              <p className="text-[11px] font-bold text-gray-300">
                بهترین مدل برای کد نویسی
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

        {/* کارت ۵ */}
        <div className="sm:col-span-1 md:col-span-4 row-span-1 bg-[#12e2a3] border-[3.5px] border-black rounded-[24px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">

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

        {/* کارت ۶ */}
        <div className="sm:col-span-2 md:col-span-4 row-span-1 bg-[#ff8f1f] border-[3.5px] border-black rounded-[24px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-between gap-4">
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