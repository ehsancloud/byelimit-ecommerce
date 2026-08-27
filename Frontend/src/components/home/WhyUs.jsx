// src/components/home/WhyUs.jsx
"use client";

import { ShieldCheck, Zap, Headphones, Lock } from "lucide-react";

export default function WhyUs() {
  const features = [
    {
      title: "تحویل سیستمی زیر ۵ دقیقه",
      desc: "بلافاصله پس از پرداخت لایسنس و اطلاعات اکانت صادر می‌شود.",
      icon: Zap,
      bg: "bg-[#ccff00]",
    },
    {
      title: "گارانتی ۱۰۰٪ تعویض",
      desc: "پشتیبانی تا آخرین روز اشتراک با ضمانت بازگشت وجه.",
      icon: ShieldCheck,
      bg: "bg-[#12e2a3]",
    },
    {
      title: "پشتیبانی تخصصی ۲۴/۷",
      desc: "پاسخگویی سریع در تلگرام و سیستم تیکتینگ آنلاین.",
      icon: Headphones,
      bg: "bg-[#ff8f1f]",
    },
    {
      title: "حفظ کامل حریم خصوصی",
      desc: "اکانت‌های اختصاصی بدون دسترسی سایر افراد به چت‌ها.",
      icon: Lock,
      bg: "bg-purple-300",
    },
  ];

  return (
    <section className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-10 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl">
      <h2 className="text-2xl font-black mb-8 border-b-[3px] border-black pb-3 inline-block">
        چرا خرید از بای لیمیت؟
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="bg-[#f8f9fa] border-[2.5px] border-black rounded-2xl p-5 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-3"
            >
              <div
                className={`w-12 h-12 ${f.bg} border-[2px] border-black rounded-xl flex items-center justify-center shadow-[-2px_2px_0_0_rgba(0,0,0,1)]`}
              >
                <Icon className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <h3 className="font-black text-base text-black">{f.title}</h3>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
