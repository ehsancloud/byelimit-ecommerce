"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Clock, Headphones, Send } from "lucide-react";

const TELEGRAM_URL  = "tg://resolve?domain=byelimit_support";
const ENAMAD_CODE   = "Ceg4lOPM2wFTkgCRKw3gAG5KgbSSAXTC";
const ENAMAD_ID     = "7510836";
const ENAMAD_HREF   = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_IMG    = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

export default function Footer() {
  return (
    <footer className="bg-white border-t-[3.5px] border-black font-[family-name:var(--font-farsi)] dir-rtl text-black mt-20 select-none">

      {/* نوار ویژگی‌ها */}
      <div className="border-b-[3.5px] border-black bg-[#ccff00]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { bg: "#12e2a3", Icon: Zap,        title: "تحویل سریع سیستم",      sub: "در ساعات پشتیبانی، به‌صورت هوشمند" },
            { bg: "#ff8f1f", Icon: ShieldCheck, title: "ضمانت ۱۰۰٪ بازگشت",    sub: "ضمانت تعویض و عودت وجه" },
            { bg: "#e9d5ff", Icon: Clock,       title: "اشتراک‌های اختصاصی",    sub: "کاملاً قانونی و با حریم خصوصی" },
            { bg: "#a5f3fc", Icon: Headphones,  title: "پشتیبانی هرروز ۱۰ تا ۲۲", sub: "پاسخگویی سریع تیکت و تلگرام" },
          ].map(({ bg, Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
              <div className="p-2 border-[2px] border-black rounded-lg shrink-0" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-xs md:text-sm">{title}</h4>
                <p className="text-[11px] font-bold text-gray-700">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* محتوای اصلی */}
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
                    style={{ height: "85px", width: "auto", objectFit: "contain", filter: "drop-shadow(-3px 3px 0 rgba(0,0,0,1))" }} />
                  <span className="absolute right-4 bottom-7 font-black text-xl text-black select-none pointer-events-none rotate-[40deg]">بای!</span>
                </div>
              </Link>
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed mb-4">
              بای لیمیت بزرگ‌ترین مرجع تخصصی ارائه اکانت‌های اختصاصی ابزارهای هوش مصنوعی (ChatGPT, Claude, Midjourney) و سرورهای مجازی ثابت در ایران است.
            </p>
          </div>

          {/* نماد اعتماد - ساده و مستقیم */}
          <div>
            <p className="text-[11px] font-black text-gray-500 mb-2">نمادهای اعتماد فروشگاه بای لیمیت</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* eNamad - دقیقاً طبق کد رسمی */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a referrerPolicy="origin" target="_blank"
                href="https://trustseal.enamad.ir/?id=7510836&Code=Ceg4lOPM2wFTkgCRKw3gAG5KgbSSAXTC">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=7510836&Code=Ceg4lOPM2wFTkgCRKw3gAG5KgbSSAXTC"
                  alt=""
                  // eslint-disable-next-line react/no-unknown-property
                  code="Ceg4lOPM2wFTkgCRKw3gAG5KgbSSAXTC"
                  style={{ cursor: "pointer", width: "80px", height: "auto" }} />
              </a>
              {/* Zibal Trust Badge */}
              <a href="https://gateway.zibal.ir/trustMe/byelimit.ir" target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://zibal.ir/trust/assets/2.png"
                  alt="پرداخت آنلاین زیبال"
                  style={{ maxWidth: "90px", height: "auto" }} />
              </a>
            </div>
          </div>
        </div>

        {/* ستون ۲: ابزارهای هوش مصنوعی */}
        <div className="lg:col-span-3">
          <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">ابزارهای هوش مصنوعی</h3>
          <ul className="flex flex-col gap-2.5 text-xs font-black text-gray-800">
            {[
              ["/products/chatgpt",     "خرید اکانت ChatGPT (چت‌جی‌پی‌تی)"],
              ["/products/claude",      "خرید اشتراک Claude (کلود)"],
              ["/products/midjourney",  "خرید اکانت Midjourney (میدجرنی)"],
              ["/products/copilot",     "خرید اشتراک GitHub Copilot"],
              ["/products/runway",      "خرید اکانت Runway Gen-3"],
              ["/products/elevenlabs",  "خرید اشتراک ElevenLabs"],
              ["/products/perplexity",  "خرید اشتراک Perplexity Pro"],
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
              ["/products", "فروشگاه محصولات"],
              ["/about",    "درباره ما"],
              ["/contact",  "تماس با ما"],
              ["/faq",      "سوالات متداول"],
              ["/rules",    "قوانین و مقررات"],
            ].map(([href, label]) => (
              <li key={label}><Link href={href} className="hover:underline hover:text-black transition-colors">• {label}</Link></li>
            ))}
          </ul>
        </div>

        {/* ستون ۴: ارتباط با ما */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div>
            <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">ارتباط با ما</h3>
            <a href={TELEGRAM_URL}
              className="flex items-center gap-3 bg-[#e0f2fe] border-[2px] border-black p-3 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors mb-3">
              <Send className="w-5 h-5 stroke-[2.5] text-blue-600 shrink-0" />
              <div>
                <span className="font-black text-xs block">پشتیبانی تلگرام</span>
                <span className="text-[10px] font-bold text-gray-600 dir-ltr">@byelimit_support</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* کپی‌رایت */}
      <div className="border-t-[3.5px] border-black bg-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-gray-800">
          <p>© {new Date().getFullYear()} تمامی حقوق مادی و معنوی این وب‌سایت متعلق به بای لیمیت می‌باشد.</p>
        </div>
      </div>
    </footer>
  );
}
