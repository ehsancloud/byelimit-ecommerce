// src/components/home/HomeFaq.jsx
"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "فرآیند تحویل اکانت‌ها چقدر زمان می‌برد؟",
      answer:
        "بلافاصله پس از تایید پرداخت، لینک مستقیم پشتیبانی تلگرام در اختیارتان قرار می‌گیرد و تحویل توسط تیم پشتیبانی در سریع‌ترین زمان ممکن، در ساعات پاسخگویی (هرروز ۱۰ تا ۲۲)، انجام می‌شود.",
    },
    {
      question: "آیا اکانت‌های اختصاصی گارانتی دارند؟",
      answer:
        "بله، ۱۰۰٪ اکانت‌ها تا آخرین روز اشتراک شامل ضمانت کارکرد و پشتیبانی هستند.",
    },
    {
      question: "آیا برای استفاده نیازمند تحریم‌شکن (VPN) هستم؟",
      answer:
        "بله، اکثر سرویس‌های هوش مصنوعی بین‌المللی نیازمند آی‌پی غیرایران (ترجیحاً آی‌پی ثابت) هستند.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <HelpCircle className="w-6 h-6 stroke-[2.5]" />
        <h2 className="text-2xl font-black">سوالات متداول خریداران</h2>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border-[2.5px] border-black rounded-xl overflow-hidden bg-white shadow-[-3px_3px_0_0_rgba(0,0,0,1)]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 font-black text-sm flex items-center justify-between text-right bg-white hover:bg-gray-50 cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="p-4 bg-gray-50 border-t-[2px] border-black text-xs md:text-sm font-bold text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
