// src/components/layout/header/CategoryDropdown.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Sparkles,
  Server,
  Crown,
  FileText,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  GraduationCap,
  Clapperboard,
  Gamepad2,
  Palette,
  TrendingUp,
  BookOpen,
  Send,
  ArrowLeft,
  Flame,
} from "lucide-react";

// دسته‌بندی‌های زیرمجموعه هر تب مگامنو - ترتیب دقیقاً مطابق خواسته:
// ۱. ابزارهای هوش مصنوعی  ۲. اشتراک‌ها و اکانت‌های پرمیوم  ۳. سرور مجازی
const AI_TOOLS_ITEMS = [
  { href: "/products/category/text", icon: FileText, color: "bg-purple-200", title: "تولید محتوا و متن", desc: "نگارش مقاله، چت‌بات، بازنویسی متون و خلاصه‌نویسی" },
  { href: "/products/category/code", icon: Code2, color: "bg-emerald-200", title: "برنامه نویسی و توسعه نرم افزار", desc: "کدنویسی هوشمند، رفع باگ و بازسازی کد" },
  { href: "/products/category/image", icon: ImageIcon, color: "bg-amber-200", title: "ساخت و ادیت عکس", desc: "تولید تصویر، طراحی گرافیکی، ویرایش تصویر و پوستر" },
  { href: "/products/category/video", icon: Video, color: "bg-rose-200", title: "ساخت و ادیت ویدیو", desc: "تولید فیلم، تدوین هوشمند ویدیو و انیمیشن" },
  { href: "/products/category/audio", icon: Music, color: "bg-cyan-200", title: "ساخت صدا و موسیقی", desc: "صداگذاری، تولید موزیک، گویندگی و پادکست" },
  { href: "/products/category/research", icon: GraduationCap, color: "bg-indigo-200", title: "تحقیق و آموزش", desc: "جستجوی علمی، مقاله نویسی و تحلیل داده" },
];

const PREMIUM_ITEMS = [
  { href: "/products/category/film-music", icon: Clapperboard, color: "bg-red-200", title: "فیلم و موسیقی", desc: "اشتراک Netflix، Spotify و پلتفرم‌های پخش آنلاین" },
  { href: "/products/category/gaming", icon: Gamepad2, color: "bg-violet-200", title: "گیمینگ و بازی", desc: "اشتراک Xbox Game Pass، PlayStation Plus" },
  { href: "/products/category/design-graphics", icon: Palette, color: "bg-pink-200", title: "طراحی و گرافیک", desc: "اشتراک Figma و ابزارهای طراحی حرفه‌ای" },
  { href: "/products/category/seo-marketing", icon: TrendingUp, color: "bg-lime-200", title: "سئو و مارکتینگ", desc: "اشتراک Ahrefs، Semrush و LinkedIn Premium" },
  { href: "/products/category/education-utility", icon: BookOpen, color: "bg-orange-200", title: "آموزش و کاربردی", desc: "اشتراک پلتفرم‌های آموزشی و ابزارهای کاربردی" },
  { href: "/products/category/telegram", icon: Send, color: "bg-sky-200", title: "تلگرام", desc: "خرید تلگرام پرمیوم و استارز تلگرام" },
];

const VPS_ITEMS = [
  { href: "/products/vps-germany", emoji: "🇩🇪", color: "bg-blue-200", title: "سرور مجازی آلمان (Germany VPS)", desc: "آی‌پی ثابت اختصاصی، پینگ پایین و مناسب ترید" },
  { href: "/products/vps-finland", emoji: "🇫🇮", color: "bg-indigo-200", title: "سرور مجازی فنلاند (Finland VPS)", desc: "سرعت بالا مناسب حساب‌های بین‌المللی و پی‌پال" },
  { href: "/products/vps-usa", emoji: "🇺🇸", color: "bg-red-200", title: "سرور مجازی آمریکا (USA VPS)", desc: "آی پی اختصاصی آمریکا، مناسب یوتیوب و AI" },
];

const TABS = [
  {
    key: "ai-tools",
    label: "ابزارهای هوش مصنوعی",
    desc: "تولید متن، تصویر، کد، ویدیو، صوت و تحقیق",
    icon: Sparkles,
    activeClass: "bg-[#ccff00]",
    items: AI_TOOLS_ITEMS,
    hoverClass: "hover:bg-[#fff9c4]",
  },
  {
    key: "premium",
    label: "اشتراک‌ها و اکانت‌های پرمیوم",
    desc: "فیلم، موسیقی، گیمینگ، طراحی، سئو و آموزش",
    icon: Crown,
    activeClass: "bg-[#ffd166]",
    items: PREMIUM_ITEMS,
    hoverClass: "hover:bg-[#fdf0ff]",
  },
  {
    key: "vps",
    label: "سرور مجازی (VPS)",
    desc: "آی‌پی ثابت اختصاصی کشورهای مختلف برای ترید و وب‌گردی",
    icon: Server,
    activeClass: "bg-[#12e2a3]",
    items: VPS_ITEMS,
    hoverClass: "hover:bg-[#e0f2fe]",
  },
];

export default function CategoryDropdown({
  activeMenu,
  setActiveMenu,
  isScrolled,
}) {
  const [activeTab, setActiveTab] = useState("ai-tools");
  const currentTab = TABS.find((t) => t.key === activeTab);

  const handleLinkClick = () => {
    setActiveMenu(null);
  };

  return (
    <div
      className="relative flex items-stretch"
      onMouseEnter={() => setActiveMenu("products")}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* دکمه سربرگ محصولات */}
      <button
        className={`flex items-center gap-2 px-6 border-x-[3.5px] border-black font-black text-base transition-colors ${
          activeMenu === "products"
            ? "bg-[#12e2a3]"
            : "bg-white hover:bg-gray-100"
        }`}
      >
        <span>محصولات</span>
        <ChevronDown
          className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${
            activeMenu === "products" ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* مگامنو و پل نامرئی */}
      {activeMenu === "products" && (
        <>
          {/* ناچ متصل‌کننده (Triangle Notch) */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 pointer-events-none -mt-[3.5px]">
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L22 14H2L12 2Z" fill="#12e2a3" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
            </svg>
          </div>

          {/* کانتینر اصلی مگامنو */}
          <div
            className={`fixed left-0 right-0 w-full max-w-7xl mx-auto px-4 z-40 transition-all duration-300 ${
              isScrolled ? "top-[56px]" : "top-[80px]"
            }`}
          >
            {/* پل نامرئی جهت حفظ hover */}
            <div className="w-full h-4 bg-transparent" />

            {/* بدنه اصلی کارت مگامنو */}
            <div className="bg-white border-[3.5px] border-black rounded-[20px] shadow-[-10px_10px_0_0_rgba(0,0,0,1)] p-6 grid grid-cols-12 gap-6 relative">
              {/* ستون راست: تب‌ها - ترتیب: ابزار هوش مصنوعی، اشتراک پرمیوم، سرور مجازی */}
              <div className="col-span-4 flex flex-col gap-3 border-l-[2.5px] border-black pl-4">
                {TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onMouseEnter={() => setActiveTab(tab.key)}
                      className={`w-full text-right p-3.5 rounded-xl border-[2.5px] border-black font-black text-sm flex items-center justify-between transition-all ${
                        activeTab === tab.key
                          ? `${tab.activeClass} shadow-[-4px_4px_0_0_rgba(0,0,0,1)] translate-x-1`
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className="text-base font-black">{tab.label}</div>
                        <div className="text-xs font-bold text-gray-600 mt-0.5">
                          {tab.desc}
                        </div>
                      </div>
                      <TabIcon className="w-5 h-5 stroke-[2.5] shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* ستون وسط: دسته‌بندی‌های تب فعال */}
              <div className="col-span-5 grid grid-cols-1 gap-2 border-l-[2.5px] border-black pl-4 max-h-[420px] overflow-y-auto pr-1">
                {currentTab.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 p-2 rounded-xl border-[2px] border-transparent hover:border-black ${currentTab.hoverClass} transition-all group`}
                    >
                      <div className={`p-2 ${item.color} border-[2px] border-black rounded-lg font-black text-xs flex items-center justify-center min-w-[36px] min-h-[36px]`}>
                        {ItemIcon ? <ItemIcon className="w-5 h-5 stroke-[2.5]" /> : item.emoji}
                      </div>
                      <div>
                        <div className="font-black text-sm group-hover:underline">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-bold text-gray-500">
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ستون چپ: محصول ویژه */}
              <div className="col-span-3 bg-[#ff8f1f]/20 border-[2.5px] border-black rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 bg-[#ff8f1f] border border-black text-[11px] font-black px-2 py-0.5 rounded text-black mb-2">
                    <Flame className="w-3.5 h-3.5 fill-black" />
                    <span>پرفروش‌ترین ماه</span>
                  </div>
                  <h4 className="font-black text-base mt-1">اکانت ChatGPT Plus</h4>
                  <p className="text-xs font-bold text-gray-700 mt-2 leading-relaxed">
                    دسترسی به GPT-4o با تحویل سریع.
                  </p>
                </div>

                <Link
                  href="/products/chatgpt"
                  onClick={handleLinkClick}
                  className="mt-4 bg-[#ccff00] hover:bg-[#b5e600] text-black text-center font-black text-xs py-2.5 rounded-lg border-[2px] border-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>مشاهده و خرید</span>
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
