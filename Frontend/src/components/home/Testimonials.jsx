// src/components/home/Testimonials.jsx
"use client";

import { Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "رضا محمدی",
      tool: "ChatGPT Plus",
      comment:
        "کمتر از ۲ دقیقه اکانت تحویل داده شد و الان ۱ ماهه بدون قطعی استفاده می‌کنم.",
      rating: 5,
    },
    {
      name: "سارا حسینی",
      tool: "Midjourney v6",
      comment:
        "بهترین قیمتی که پیدا کردم همینجا بود. گارانتی تعویضشون هم واقعی هست.",
      rating: 5,
    },
    {
      name: "علی کاظمی",
      tool: "Claude Pro",
      comment:
        "برای کدنویسی احتیاج داشتم و پشتیبانی تلگرام دقیقاً راهنماییم کرد چطور متصل بشم.",
      rating: 5,
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <MessageSquareQuote className="w-6 h-6 stroke-[2.5]" />
        <h2 className="text-2xl font-black">رضایت خریداران واقعی</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="bg-white border-[3px] border-black rounded-[20px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-sm">{rev.name}</span>
                <span className="bg-[#12e2a3] border border-black text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> خریدار تاییدشده
                </span>
              </div>
              <span className="inline-block bg-[#fff9c4] border border-black text-xs font-black px-2 py-0.5 rounded mb-2">
                اکانت: {rev.tool}
              </span>
              <p className="text-xs font-bold text-gray-700 leading-relaxed">
                {rev.comment}
              </p>
            </div>

            <div className="flex gap-1 text-[#ffc107]">
              {[...Array(rev.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-[#ffc107] stroke-[#ffc107]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
