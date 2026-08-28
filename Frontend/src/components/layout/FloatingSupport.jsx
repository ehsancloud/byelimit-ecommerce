// src/components/layout/FloatingSupport.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, Send, X, Clock } from "lucide-react";

// TODO: شماره تماس و آیدی/لینک تلگرام واقعی پشتیبانی جایگزین شود.
const SUPPORT_PHONE_DISPLAY = "۰۲۱-۰۰۰۰۰۰۰";
const SUPPORT_PHONE_TEL = "+9821xxxxxxx";
const SUPPORT_TELEGRAM_URL = "https://t.me/byelimit_support";
const WORKING_HOURS_LABEL = "پاسخگویی و تحویل: هرروز ساعت ۱۰ تا ۲۲";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 font-[family-name:var(--font-farsi)] dir-rtl"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-[72px] left-0 w-64 bg-white border-[3px] border-black rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="bg-[#12e2a3] border-b-[2.5px] border-black p-3 flex items-center justify-between">
              <span className="font-black text-sm text-black">راه‌های ارتباطی</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 bg-white border-[1.5px] border-black rounded-md hover:bg-gray-100 cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2">
              <a
                href={SUPPORT_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-[#f8f9fa] hover:bg-[#e0f2fe] border-[2px] border-black rounded-xl font-black text-xs transition-colors"
              >
                <div className="w-8 h-8 bg-white border-[1.5px] border-black rounded-lg flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-blue-500 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block">پشتیبانی تلگرام</span>
                  <span className="block text-[10px] font-bold text-gray-500">
                    سریع‌ترین راه ارتباطی
                  </span>
                </div>
              </a>

              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="flex items-center gap-2.5 p-2.5 bg-[#f8f9fa] hover:bg-[#fff9c4] border-[2px] border-black rounded-xl font-black text-xs transition-colors"
              >
                <div className="w-8 h-8 bg-white border-[1.5px] border-black rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block">تماس تلفنی</span>
                  <span className="block text-[10px] font-bold text-gray-500 dir-ltr text-right">
                    {SUPPORT_PHONE_DISPLAY}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-2 px-1 pt-1 text-[10px] font-bold text-gray-600">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{WORKING_HOURS_LABEL}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 bg-[#12e2a3] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer relative active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all"
        aria-label="ارتباط با پشتیبانی"
        aria-expanded={isOpen}
      >
        {!isOpen && (
          <div className="absolute inset-0 bg-[#12e2a3] rounded-full animate-ping opacity-50 z-0" />
        )}
        {isOpen ? (
          <X className="w-6 h-6 text-black stroke-[2.5] relative z-10" />
        ) : (
          <MessageCircle className="w-7 h-7 text-black stroke-[2.5] relative z-10" />
        )}
      </button>
    </div>
  );
}
