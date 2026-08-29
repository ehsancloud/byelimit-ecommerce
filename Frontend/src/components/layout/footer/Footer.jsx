"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Clock, Headphones, Send, Sparkles } from "lucide-react";

const TELEGRAM_URL = "https://t.me/byelimit_support";
const ENAMAD_CODE = "Ceg4lOPM2wFTkgCRKw3gAG5KgbSSAXTC";
const ENAMAD_ID   = "7510836";

export default function Footer() {
  return (
    <footer className="bg-white border-t-[3.5px] border-black font-[family-name:var(--font-farsi)] dir-rtl text-black mt-20 select-none">

      {/* نوار ویژگی‌ها */}
      <div className="border-b-[3.5px] border-black bg-[#ccff00]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-[#12e2a3] border-[2px] border-black rounded-lg"><Zap className="w-5 h-5 stroke-[2.5]" /></div>
            <div><h4 className="font-black text-xs md:text-sm">تحویل سریع سیستم</h4><p className="text-[11px] font-bold text-gray-700">در ساعات پشتیبانی، به‌صورت هوشمند</p></div>
          </div>
          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-[#ff8f1f] border-[2px] border-black rounded-lg"><ShieldCheck className="w-5 h-5 stroke-[2.5]" /></div>
            <div><h4 className="font-black text-xs md:text-sm">ضمانت ۱۰۰٪ بازگشت</h4><p className="text-[11px] font-bold text-gray-700">ضمانت تعویض و عودت وجه</p></div>
          </div>
          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-purple-200 border-[2px] border-black rounded-lg"><Clock className="w-5 h-5 stroke-[2.5]" /></div>
            <div><h4 className="font-black text-xs md:text-sm">اشتراک‌های اختصاصی</h4><p className="text-[11px] font-bold text-gray-700">کاملاً قانونی و با حریم خصوصی</p></div>
          </div>
          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-cyan-200 border-[2px] border-black rounded-lg"><Headphones className="w-5 h-5 stroke-[2.5]" /></div>
            <div><h4 className="font-black text-xs md:text-sm">پشتیبانی هرروز ۱۰ تا ۲۲</h4><p className="text-[11px] font-bold text-gray-700">پاسخگویی سریع تیکت و تلگرام</p></div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی فوتر */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">

        {/* ستون ۱: لوگو + درباره */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div>
            <div className="mb-6 relative overflow-visible inline-block">
              <Link href="/" className="flex items-center justify-center w-60 h-20 bg-[#d1c4e9] border-[3.5px] border-black rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#b39ddb] transition-colors relative overflow-visible">
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                  <span className="absolute left-3 bottom-6 font-black text-xl text-black select-none pointer-events-none -rotate-[40deg]">لیمیت!</span>
                  <Image src="/images/logo.png" alt="بای لیمیت" width={140} height={100} priority
                    className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    style={{ height: "85px", width: "auto", objectFit: "contain", filter: "drop-shadow(-3px 3px 0 rgba(0,0,0,1))" }}
                  />
                  <span className="absolute right-4 bottom-7 font-black text-xl text-black select-none pointer-events-none rotate-[40deg]">بای!</span>
                </div>
              </Link>
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed mb-4">
              بای لیمیت بزرگ‌ترین مرجع تخصصی ارائه اکانت‌های اختصاصی ابزارهای هوش مصنوعی (ChatGPT, Claude, Midjourney) و سرورهای مجازی ثابت در ایران است.
            </p>
          </div>

          {/* ✅ نماد اعتماد الکترونیکی eNamad - بارز و قابل کلیک */}
          <div className="bg-[#f8f9fa] border-[2.5px] border-black rounded-2xl p-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              نماد اعتماد الکترونیکی
            </h4>
            <div className="flex items-center gap-4">
              {/* باج رسمی eNamad با کد اصلی سایت */}
              <a
                referrerPolicy="origin"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`}
                className="shrink-0 hover:opacity-90 transition-opacity"
                title="نماد اعتماد الکترونیکی - کلیک برای استعلام"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  referrerPolicy="origin"
                  src={`https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`}
                  alt="نماد اعتماد الکترونیکی بای لیمیت"
                  // eslint-disable-next-line react/no-unknown-property
                  code={ENAMAD_CODE}
                  className="w-20 h-20 object-contain cursor-pointer"
                  style={{ imageRendering: "auto" }}
                />
              </a>
              <div>
                <p className="font-black text-xs leading-tight mb-1">درگاه پرداخت قانونی</p>
                <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                  این فروشگاه دارای نماد اعتماد الکترونیکی از وزارت صنعت، معدن و تجارت ایران است.
                </p>
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`}
                  className="text-[10px] font-black text-emerald-700 hover:underline mt-1 block"
                >
                  استعلام اعتبار &larr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ستون ۲: ابزارهای هوش مصنوعی */}
        <div className="lg:col-span-3">
          <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">ابزارهای هوش مصنوعی</h3>
          <ul className="flex flex-col gap-2.5 text-xs font-black text-gray-800">
            {[
              ["/products/category/text",     "اکانت ChatGPT Plus اختصاصی"],
              ["/products/category/text",     "اشتراک حرفه‌ای Claude"],
              ["/products/category/image",    "اکانت Midjourney"],
              ["/products/category/code",     "GitHub Copilot اختصاصی"],
              ["/products/category/video",    "اکانت Sora و Runway"],
              ["/products/category/audio",    "اکانت ElevenLabs"],
              ["/products/category/research", "اشتراک Perplexity Pro"],
            ].map(([href, label]) => (
              <li key={label}><Link href={href} className="hover:underline hover:text-black transition-colors">• {label}</Link></li>
            ))}
          </ul>
        </div>

        {/* ستون ۳: لینک‌های مفید */}
        <div className="lg:col-span-2">
          <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">لینک‌های مفید</h3>
          <ul className="flex flex-col gap-2.5 text-xs font-black text-gray-800">
            {[
              ["/",         "صفحه اصلی"],
              ["/products", "فروشگاه"],
              ["/services", "خدمات"],
              ["/about",    "درباره ما"],
              ["/contact",  "تماس با ما"],
              ["/faq",      "سوالات متداول"],
              ["/rules",    "قوانین و مقررات"],
            ].map(([href, label]) => (
              <li key={label}><Link href={href} className="hover:underline hover:text-black transition-colors">• {label}</Link></li>
            ))}
          </ul>
        </div>

        {/* ستون ۴: شبکه‌های اجتماعی */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div>
            <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">ارتباط با ما</h3>

            {/* ✅ لینک تلگرام پشتیبانی با آدرس واقعی */}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#e0f2fe] border-[2px] border-black p-3 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors mb-3"
            >
              <Send className="w-5 h-5 stroke-[2.5] text-blue-600 shrink-0" />
              <div>
                <span className="font-black text-xs block">پشتیبانی تلگرام</span>
                <span className="text-[10px] font-bold text-gray-600 dir-ltr">@byelimit_support</span>
              </div>
            </a>

            <div className="flex items-center gap-3">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-[#e0f2fe] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors" aria-label="Telegram">
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-[#fce7f3] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-[#fee2e2] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* کپی‌رایت */}
      <div className="border-t-[3.5px] border-black bg-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-gray-800">
          <p>© {new Date().getFullYear()} تمامی حقوق مادی و معنوی این وب‌سایت متعلق به بای لیمیت می‌باشد.</p>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-700 hover:underline">
            <Send className="w-3.5 h-3.5" /><span>پشتیبانی تلگرام</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
