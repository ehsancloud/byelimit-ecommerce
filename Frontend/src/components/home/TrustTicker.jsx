// src/components/home/TrustTicker.jsx
"use client";

import { ShieldCheck, Zap, Headphones, Award, Users } from "lucide-react";

export default function TrustTicker() {
  const stats = [
    { icon: Zap, text: "+۵۰,۰۰۰ تحویل موفق زیر ۵ دقیقه" },
    { icon: ShieldCheck, text: "ضمانت ۱۰۰٪ بازگشت وجه و تعویض" },
    { icon: Headphones, text: "پشتیبانی ۲۴ ساعته در تلگرام" },
    { icon: Award, text: "اشتراک‌های کاملاً قانونی و اختصاصی" },
  ];

  return (
    <section className="bg-[#ccff00] border-[3.5px] border-black rounded-[20px] p-4 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden dir-rtl">
      <div className="flex items-center justify-around flex-wrap gap-4 text-black font-black text-xs md:text-sm">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white border-[2px] border-black px-3 py-2 rounded-xl shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <Icon className="w-4 h-4 text-black stroke-[2.5]" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
