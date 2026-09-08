// src/components/home/TrustTicker.jsx
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Headphones, Award } from "lucide-react";

export default function TrustTicker() {
  const stats = [
    { icon: Zap, text: "+۵۰,۰۰۰ تحویل موفق زیر ۵ دقیقه" },
    { icon: ShieldCheck, text: "ضمانت ۱۰۰٪ بازگشت وجه و تعویض" },
    { icon: Headphones, text: "پشتیبانی هر روز ۱۰ تا ۲۲ در تلگرام" },
    { icon: Award, text: "اشتراک‌های کاملاً قانونی و اختصاصی" },
  ];

  // برای لوپ بی‌نهایت، آرایه رو دو بار تکرار می‌کنیم
  const duplicatedStats = [...stats, ...stats];

  return (
    <section className="bg-[#ccff00] border-[3.5px] border-black rounded-[20px] p-4 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden dir-rtl">
      <div className="relative overflow-hidden" dir="ltr">
        {/* گرادیانت محو شونده در لبه‌ها برای زیبایی بیشتر */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-[#ccff00] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-[#ccff00] to-transparent z-10 pointer-events-none" />

        {/* انیمیشن مارکی: از ۰ به -۵۰٪ حرکت می‌کنه و چون دو کپی داریم، لوپ بی‌نهایت ایجاد میشه */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-4 w-max"
          dir="rtl"
        >
          {duplicatedStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white border-[2px] border-black px-4 py-2 rounded-xl shadow-[-2px_2px_0_0_rgba(0,0,0,1)] shrink-0"
              >
                <Icon className="w-4 h-4 text-black stroke-[2.5]" />
                <span className="text-black font-black text-xs md:text-sm whitespace-nowrap">
                  {item.text}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}