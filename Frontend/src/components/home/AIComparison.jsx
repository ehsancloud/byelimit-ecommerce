// src/components/home/AIComparison.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GitCompare, Star, Check, X } from "lucide-react";

// سیستم امتیازدهی ستاره‌ای برای خوانایی بهتر
function RatingStars({ value, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < value
              ? "fill-amber-400 stroke-amber-500"
              : "fill-gray-200 stroke-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function ApiBadge({ status }) {
  if (status === "کامل") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs">
        <Check className="w-3.5 h-3.5 stroke-[3]" /> کامل
      </span>
    );
  }
  if (status === "محدود") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 font-black text-xs">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> محدود
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-500 font-black text-xs">
      <X className="w-3.5 h-3.5 stroke-[3]" /> ندارد
    </span>
  );
}

const TABS = [
  { id: "chat", label: "چت و تولید متن" },
  { id: "image", label: "تولید تصویر" },
  { id: "code", label: "دستیار کدنویسی" },
  { id: "video", label: "تولید ویدیو" },
  { id: "audio", label: "صدا و موسیقی" },
];

const DATA = {
  chat: {
    headers: ["مدل", "قیمت ماهانه", "درک فارسی", "کدنویسی", "سرعت پاسخ", "API", "خرید"],
    rows: [
      {
        name: "ChatGPT Plus",
        img: "/images/gpt2.jpeg",
        price: "۲۰ دلار",
        lang: 5,
        skill: 4,
        speed: 4,
        api: "محدود",
        link: "/products/chatgpt",
        badge: "محبوب‌ترین",
      },
      {
        name: "Claude 3.5 Sonnet",
        img: "/images/claude.png",
        price: "۲۰ دلار",
        lang: 4,
        skill: 5,
        speed: 4,
        api: "کامل",
        link: "/products/claude",
        badge: "بهترین برای کد",
      },
      {
        name: "Gemini Advanced",
        img: "/images/gemini.png",
        price: "۲۰ دلار",
        lang: 5,
        skill: 4,
        speed: 5,
        api: "کامل",
        link: "/products/gemini",
      },
    ],
  },
  image: {
    headers: ["مدل", "قیمت ماهانه", "سبک هنری", "واقع‌گرایی", "سرعت", "API", "خرید"],
    rows: [
      {
        name: "Midjourney v6",
        img: "/images/midjourney.png",
        price: "۳۰ دلار",
        lang: 5,
        skill: 3,
        speed: 3,
        api: "محدود",
        link: "/products/midjourney",
        badge: "هنری‌ترین",
      },
      {
        name: "DALL·E 3",
        img: "/images/gpt2.jpeg",
        price: "۲۰ دلار",
        lang: 4,
        skill: 5,
        speed: 4,
        api: "کامل",
        link: "/products/chatgpt",
      },
      {
        name: "Flux Pro",
        img: "/images/midjourney.png",
        price: "۲۵ دلار",
        lang: 5,
        skill: 4,
        speed: 5,
        api: "کامل",
        link: "/products/midjourney",
      },
    ],
  },
  code: {
    headers: ["ابزار", "قیمت ماهانه", "درک کانتکست", "پشتیبانی زبان‌ها", "سرعت", "API", "خرید"],
    rows: [
      {
        name: "Cursor Pro",
        img: "/images/gpt2.jpeg",
        price: "۲۰ دلار",
        lang: 5,
        skill: 5,
        speed: 5,
        api: "کامل",
        link: "/products/copilot",
        badge: "پیشنهاد تیم",
      },
      {
        name: "GitHub Copilot",
        img: "/images/claude.png",
        price: "۱۰ دلار",
        lang: 4,
        skill: 4,
        speed: 5,
        api: "کامل",
        link: "/products/copilot",
      },
      {
        name: "Claude Code",
        img: "/images/claude.png",
        price: "۲۰ دلار",
        lang: 4,
        skill: 5,
        speed: 4,
        api: "کامل",
        link: "/products/claude",
      },
    ],
  },
  video: {
    headers: ["ابزار", "قیمت ماهانه", "کیفیت خروجی", "مدت زمان کلیپ", "سرعت رندر", "API", "خرید"],
    rows: [
      {
        name: "Runway Gen-3",
        img: "/images/midjourney.png",
        price: "۳۵ دلار",
        lang: 5,
        skill: 3,
        speed: 3,
        api: "کامل",
        link: "/products/midjourney",
        badge: "حرفه‌ای",
      },
      {
        name: "Pika Labs",
        img: "/images/gpt2.jpeg",
        price: "۱۵ دلار",
        lang: 4,
        skill: 4,
        speed: 4,
        api: "محدود",
        link: "/products/chatgpt",
      },
      {
        name: "Sora (OpenAI)",
        img: "/images/gpt2.jpeg",
        price: "۲۰۰ دلار",
        lang: 5,
        skill: 5,
        speed: 2,
        api: "محدود",
        link: "/products/chatgpt",
      },
    ],
  },
  audio: {
    headers: ["ابزار", "قیمت ماهانه", "کیفیت صدا", "تنوع زبان", "سرعت", "API", "خرید"],
    rows: [
      {
        name: "ElevenLabs",
        img: "/images/claude.png",
        price: "۲۲ دلار",
        lang: 5,
        skill: 4,
        speed: 5,
        api: "کامل",
        link: "/products/claude",
        badge: "طبیعی‌ترین صدا",
      },
      {
        name: "Suno AI",
        img: "/images/midjourney.png",
        price: "۱۰ دلار",
        lang: 4,
        skill: 5,
        speed: 4,
        api: "محدود",
        link: "/products/midjourney",
      },
      {
        name: "Udio",
        img: "/images/gemini.png",
        price: "۱۰ دلار",
        lang: 4,
        skill: 5,
        speed: 4,
        api: "محدود",
        link: "/products/gemini",
      },
    ],
  },
};

export default function AIComparison() {
  const [activeTab, setActiveTab] = useState("chat");
  const current = DATA[activeTab];

  return (
    <section>
      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <GitCompare className="w-6 h-6 stroke-[3]" />
        <h2 className="text-2xl font-black">کدام ابزار برای من مناسب‌تر است؟</h2>
      </div>

      <div className="bg-white border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)]">
        {/* تب‌ها */}
        <div className="flex items-center border-b-[3.5px] border-black bg-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 font-black text-xs sm:text-sm border-l-[3.5px] border-black transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* جدول */}
        <div className="p-4 md:p-8 overflow-x-auto relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-white pointer-events-none z-10 md:hidden" />

          <table className="w-full text-right text-xs md:text-sm font-bold min-w-[700px]">
            <thead className="bg-[#ccff00] border-[2.5px] border-black font-black">
              <tr>
                {current.headers.map((h, i) => (
                  <th
                    key={i}
                    className={`p-4 ${
                      i < current.headers.length - 1 ? "border-l-[2.5px] border-black" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.rows.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-x-[2.5px] border-b-[2.5px] border-black hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 border-l-[2.5px] border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 relative rounded-lg overflow-hidden border-[1.5px] border-black shrink-0">
                        <Image src={item.img} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-black text-base">{item.name}</div>
                        {item.badge && (
                          <span className="text-[10px] font-black text-gray-500">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black">
                    <span className="bg-gray-100 border border-black px-2 py-1 rounded text-xs font-black">
                      {item.price}
                    </span>
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black">
                    <RatingStars value={item.lang} />
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black">
                    <RatingStars value={item.skill} />
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black">
                    <RatingStars value={item.speed} />
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black">
                    <ApiBadge status={item.api} />
                  </td>
                  <td className="p-4">
                    <Link
                      href={item.link}
                      className="bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1 hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      مشاهده پلن <ArrowLeft className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* زیرنویس راهنما */}
        <div className="px-4 md:px-8 py-3 bg-gray-50 border-t-[2.5px] border-black flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-600">
          <span>راهنما:</span>
          <span className="flex items-center gap-1">
            <RatingStars value={5} /> بالاترین کیفیت
          </span>
          <span className="flex items-center gap-1">
            <ApiBadge status="کامل" />
          </span>
          <span>• قیمت‌ها بر اساس پلن پایه ماهانه درج شده است.</span>
        </div>
      </div>
    </section>
  );
}