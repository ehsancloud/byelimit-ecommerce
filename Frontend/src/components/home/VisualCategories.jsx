// src/components/home/VisualCategories.jsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  GraduationCap,
  LayoutGrid,
  Film,
  Gamepad2,
  Palette,
  TrendingUp,
  Sparkles,
  Send,
  Server,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function VisualCategories() {
  const scrollRef = useRef(null);

  const categories = [
    { name: "تولید متن و چت", icon: FileText, color: "bg-purple-200", href: "/products/category/text" },
    { name: "برنامه نویسی و کد", icon: Code2, color: "bg-emerald-200", href: "/products/category/code" },
    { name: "تولید و ادیت عکس", icon: ImageIcon, color: "bg-amber-200", href: "/products/category/image" },
    { name: "ساخت ویدیو", icon: Video, color: "bg-rose-200", href: "/products/category/video" },
    { name: "صدا و موسیقی", icon: Music, color: "bg-cyan-200", href: "/products/category/audio" },
    { name: "تحقیق و آموزش", icon: GraduationCap, color: "bg-indigo-200", href: "/products/category/research" },
    { name: "فیلم و سریال", icon: Film, color: "bg-red-200", href: "/products/category/film-music" },
    { name: "بازی و گیمینگ", icon: Gamepad2, color: "bg-lime-200", href: "/products/category/gaming" },
    { name: "طراحی و گرافیک", icon: Palette, color: "bg-orange-200", href: "/products/category/design-graphics" },
    { name: "سئو و مارکتینگ", icon: TrendingUp, color: "bg-blue-200", href: "/products/category/seo-marketing" },
    { name: "کاربردی و ابزار ها", icon: Sparkles, color: "bg-yellow-200", href: "/products/category/education-utility" },
    { name: "تلگرام پرمیوم", icon: Send, color: "bg-sky-200", href: "/products/category/telegram" },
    { name: "سرور مجازی VPS", icon: Server, color: "bg-teal-200", href: "/products/category/vps" },
  ];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b-[3.5px] border-black pb-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <h2 className="text-xl sm:text-2xl font-black">
            دسته بندی موضوعی ابزار ها و اشتراک ها
          </h2>
        </div>

        {/* دکمه های اسکرول افقی در دسکتاپ */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll("right")}
            className="p-1.5 bg-white border-[2px] border-black rounded-lg hover:bg-gray-100 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all cursor-pointer"
            aria-label="اسکرول راست"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={() => handleScroll("left")}
            className="p-1.5 bg-white border-[2px] border-black rounded-lg hover:bg-gray-100 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all cursor-pointer"
            aria-label="اسکرول چپ"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* اسکرول کروسل افقی و کارت های جمع و جورتر */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x dir-rtl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className="snap-start shrink-0 w-[105px] sm:w-[125px] bg-white border-[2.5px] sm:border-[3px] border-black rounded-2xl p-2.5 sm:p-3 shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[-5px_5px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center text-center gap-2 no-underline text-black group active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none select-none"
            >
              <div
                className={`p-2 sm:p-2.5 ${cat.color} border-[2px] border-black rounded-xl group-hover:scale-110 transition-transform shrink-0`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="font-black text-[11px] sm:text-xs leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}