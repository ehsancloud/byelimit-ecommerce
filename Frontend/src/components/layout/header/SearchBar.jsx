// src/components/layout/header/SearchBar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowLeft, Sparkles } from "lucide-react";

// دیتای موقت محصولات برای جستجوی زنده
const SAMPLE_PRODUCTS = [
  {
    id: "chatgpt",
    titleFa: "اکانت اختصاصی ChatGPT Plus",
    category: "متن و چت‌بات",
    price: "۹۸۰,۰۰۰ تومان",
    image: "/images/gpt2.jpeg",
  },
  {
    id: "gemini",
    titleFa: "اکانت اختصاصی Gemini Advanced",
    category: "متن و چت‌بات",
    price: "۸۵۰,۰۰۰ تومان",
    image: "/images/gemini-color.png",
  },
  {
    id: "claude",
    titleFa: "اشتراک حرفه‌ای Claude Pro",
    category: "برنامه‌نویسی و متن",
    price: "۱,۱۰,۰۰۰ تومان",
    image: "/images/claude.png",
  },
  {
    id: "midjourney",
    titleFa: "اکانت اختصاصی Midjourney",
    category: "تصویر و هنر",
    price: "۱,۴۵۰,۰۰۰ تومان",
    image: "/images/midjourney.png",
  },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // بستن دراپ‌داون با کلیک خارج از کامپوننت
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = query.trim()
    ? SAMPLE_PRODUCTS.filter(
        (p) =>
          p.titleFa.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4">
      {/* اینپوت اصلی سرچ */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="جستجوی ابزارها (ChatGPT, Gemini...)"
          className="w-full bg-[#f8f9fa] border-[2.5px] border-black rounded-xl py-2 pr-10 pl-10 text-sm font-bold text-black placeholder-gray-500 outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
        />
        <Search className="w-5 h-5 absolute right-3 stroke-[2.5] text-gray-700 pointer-events-none" />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute left-3 text-gray-500 hover:text-black"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>

      {/* دراپ‌داون نتایج زنده */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white border-[3px] border-black rounded-xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] p-3 z-50">
          <div className="text-xs font-black text-gray-500 mb-2 px-1">
            نتایج مرتبط با «{query}»
          </div>

          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2 rounded-lg border-[2px] border-transparent hover:border-black hover:bg-[#ccff00]/20 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 relative border-[1.5px] border-black rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.titleFa}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-black group-hover:underline">
                        {item.titleFa}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-[#12e2a3] border border-black px-2 py-0.5 rounded">
                    {item.price}
                  </span>
                </Link>
              ))}

              {/* گزینه نمایش همه نتایج */}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="mt-2 flex items-center justify-between bg-black text-white p-2.5 rounded-lg text-xs font-black hover:bg-gray-800 transition-colors"
              >
                <span>مشاهده همه نتایج</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-extrabold text-gray-600">
              هیچ محصولی با این عنوان یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
