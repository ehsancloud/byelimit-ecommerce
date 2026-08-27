// src/components/layout/footer/Footer.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Clock,
  Headphones,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-white border-t-[3.5px] border-black font-[family-name:var(--font-farsi)] dir-rtl text-black mt-20 select-none">
      {/* بخش اول: نوار ویژگی‌ها و نمادهای اعتماد (Value Propositions) */}
      <div className="border-b-[3.5px] border-black bg-[#ccff00]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-[#12e2a3] border-[2px] border-black rounded-lg">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs md:text-sm">تحویل سریع سیستم</h4>
              <p className="text-[11px] font-bold text-gray-700">
                در ساعات پشتیبانی، به‌صورت هوشمند
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-[#ff8f1f] border-[2px] border-black rounded-lg">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs md:text-sm">
                ضمانت ۱۰۰٪ بازگشت
              </h4>
              <p className="text-[11px] font-bold text-gray-700">
                ضمانت تعویض و عودت وجه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-purple-200 border-[2px] border-black rounded-lg">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs md:text-sm">
                اشتراک‌های اختصاصی
              </h4>
              <p className="text-[11px] font-bold text-gray-700">
                کاملاً قانونی و با حریم خصوصی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border-[2.5px] border-black p-3.5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="p-2 bg-cyan-200 border-[2px] border-black rounded-lg">
              <Headphones className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs md:text-sm">پشتیبانی هرروز ۱۰ تا ۲۲</h4>
              <p className="text-[11px] font-bold text-gray-700">
                پاسخگویی سریع تیکت و تلگرام
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* بخش دوم: محتوای اصلی فوتر */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* ستون ۱: درباره بای لیمیت و لوگوی اختصاصی (۴ ستون) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          <div>
            {/* لوگوی سرک‌کشیده اختصاصی با متون لیمیت! و بای! */}
            <div className="mb-6 relative overflow-visible inline-block">
              <Link
                href="/"
                className="flex items-center justify-center w-60 h-20 bg-[#d1c4e9] border-[3.5px] border-black rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#b39ddb] transition-colors relative overflow-visible"
              >
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                  {/* نوشته لیمیت! سمت چپ */}
                  <span className="absolute left-3 bottom-6 font-black text-xl text-black select-none pointer-events-none -rotate-[40deg]">
                    لیمیت!
                  </span>

                  {/* عکس لوگوی کاراکتر */}
                  <Image
                    src="/images/logo.png"
                    alt="بای لیمیت"
                    width={140}
                    height={100}
                    priority
                    className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    style={{
                      height: "85px",
                      width: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(-3px 3px 0 rgba(0,0,0,1))",
                    }}
                  />

                  {/* نوشته بای! سمت راست */}
                  <span className="absolute right-4 bottom-7 font-black text-xl text-black select-none pointer-events-none rotate-[40deg]">
                    بای!
                  </span>
                </div>
              </Link>
            </div>

            <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed mb-4">
              بای لیمیت بزرگ‌ترین مرجع تخصصی ارائه اکانت‌های اختصاصی ابزارهای
              هوش مصنوعی (ChatGPT, Claude, Midjourney) و سرورهای مجازی ثابت در
              ایران است.
            </p>
          </div>
        </div>

        {/* ستون ۲: لینک‌های میانبر ابزارها (۳ ستون) */}
        <div className="lg:col-span-3">
          <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">
            ابزارهای هوش مصنوعی
          </h3>
          <ul className="flex flex-col gap-2.5 text-xs font-black text-gray-800">
            <li>
              <Link
                href="/products/category/content-creation"
                className="hover:underline hover:text-black transition-colors"
              >
                • اکانت ChatGPT Plus اختصاصی
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/content-creation"
                className="hover:underline hover:text-black transition-colors"
              >
                • اشتراک حرفه‌ای Claude 3.5 Sonnet
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/image-editing"
                className="hover:underline hover:text-black transition-colors"
              >
                • اکانت Midjourney v6 Standard
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/coding-development"
                className="hover:underline hover:text-black transition-colors"
              >
                • اکانت GitHub Copilot & Cursor AI
              </Link>
            </li>
            <li>
              <Link
                href="/products/category/video-editing"
                className="hover:underline hover:text-black transition-colors"
              >
                • سرویس Runway Gen-2 & Suno AI
              </Link>
            </li>
          </ul>
        </div>

        {/* ستون ۳: صفحات اصلی و مجله (۲ ستون) */}
        <div className="lg:col-span-2">
          <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">
            دسترسی سریع
          </h3>
          <ul className="flex flex-col gap-2.5 text-xs font-black text-gray-800">
            <li>
              <Link
                href="/products"
                className="hover:underline hover:text-black transition-colors"
              >
                • فروشگاه محصولات
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:underline hover:text-black transition-colors"
              >
                • مجله و وبلاگ آموزشی
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="hover:underline hover:text-black transition-colors"
              >
                • خدمات و سفارشات
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:underline hover:text-black transition-colors"
              >
                • تماس با ما و پشتیبانی
              </Link>
            </li>
            <li>
              <Link
                href="/rules"
                className="hover:underline hover:text-black transition-colors"
              >
                • قوانین و مقررات استفاده
              </Link>
            </li>
          </ul>
        </div>

        {/* ستون ۴: شبکه‌های اجتماعی و نماد اعتماد (۳ ستون) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-black text-base mb-4 border-b-[2.5px] border-black pb-2 inline-block">
              شبکه‌های اجتماعی
            </h3>
            <div className="flex items-center gap-3">
              {/* لینک تلگرام */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#e0f2fe] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="Telegram"
              >
                <svg
                  className="w-5 h-5 fill-current text-black"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>

              {/* لینک اینستاگرام */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#fce7f3] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 fill-current text-black"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* لینک یوتیوب */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#fee2e2] border-[2px] border-black rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5 fill-current text-black"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* باکس جایگاه ای‌نماد یا نماد اعتماد */}
          <div className="bg-white border-[2.5px] border-black rounded-2xl p-3 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
            {/* TODO: به‌محض دریافت نماد اعتماد الکترونیکی واقعی، این بخش با اسکریپت/بج رسمی enamad.ir
                (شامل لینک قابل‌کلیک به صفحه استعلام) جایگزین شود. تا آن زمان نمایش یک بج
                جعلی/غیرقابل‌کلیک عمداً حذف شده تا ادعای نادرست گواهی داده نشود. */}
            <div className="w-12 h-12 bg-gray-100 border-[2px] border-black rounded-xl flex items-center justify-center font-black text-[9px] text-center leading-tight px-1">
              در حال دریافت
            </div>
            <div>
              <h5 className="font-black text-xs">نماد اعتماد الکترونیکی</h5>
              <p className="text-[10px] font-bold text-gray-600">
                درگاه پرداخت قانونی و تاییدشده
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* بخش سوم: کپی‌رایت و امضای انتهای فوتر */}
      <div className="border-t-[3.5px] border-black bg-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-gray-800">
          <p>
            © {new Date().getFullYear()} تمامی حقوق مادی و معنوی این وب‌سایت متعلق به بای لیمیت
            می‌باشد.
          </p>
        </div>
      </div>
    </footer>
  );
}
