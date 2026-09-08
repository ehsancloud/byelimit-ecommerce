// src/components/home/WhyUs.jsx
"use client";

import { ShieldCheck, Zap, Headphones, Lock } from "lucide-react";

export default function WhyUs() {
  const features = [
    {
      title: "تحویل سریع با تأیید هویت",
      desc: "پس از پرداخت، اطلاعات اکانت اختصاصی از طریق پشتیبانی تلگرام در کوتاه‌ترین زمان ممکن تحویل داده می‌شود.",
      icon: Zap,
      bg: "bg-rose-300",
    },
    {
      title: "ضمانت کارکرد تا آخرین روز",
      desc: "در صورت بروز هرگونه مشکل فنی، بدون قید و شرط جایگزین یا بازگشت وجه دریافت می‌کنید.",
      icon: ShieldCheck,
      bg: "bg-purple-300",
    },
    {
      title: "پشتیبانی هر روز ۱۰ تا ۲۲",
      desc: "تیم فنی بای لیمیت هر روز از ساعت ۱۰ صبح تا ۱۰ شب آماده پاسخگویی در تلگرام است.",
      icon: Headphones,
      bg: "bg-pink-300",
    },
    {
      title: "اکانت اختصاصی و خصوصی",
      desc: "هر اکانت فقط متعلق به شماست — بدون اشتراک‌گذاری و با حفظ کامل حریم خصوصی.",
      icon: Lock,
      bg: "bg-violet-300",
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
              className={`${f.bg} border-[2.5px] border-black rounded-2xl p-5 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-3 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-300`}
            >
              <div
                className="w-12 h-12 bg-white border-[2px] border-black rounded-xl flex items-center justify-center shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <Icon className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <h3 className="font-black text-base text-black">{f.title}</h3>
              <p className="text-sm font-bold text-black/80 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}