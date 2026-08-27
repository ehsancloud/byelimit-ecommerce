// src/components/product/FaqAccordion.jsx
"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base md:text-lg font-black text-black mb-2">
        پاسخ به سوالات متداول پیش از خرید
      </h3>
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border-[2.5px] border-black rounded-xl overflow-hidden bg-white shadow-[-2px_2px_0_0_rgba(0,0,0,1)] transition-all"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full p-4 font-black text-xs md:text-sm flex items-center justify-between text-right bg-white hover:bg-gray-50 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{faq.question}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
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
  );
}
