// src/components/layout/header/Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  ChevronDown,
  Sparkles,
  Server,
  Zap,
  Headphones,
  FileText,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";

import SearchBar from "./SearchBar";
import CategoryDropdown from "./CategoryDropdown";
import Navbar from "./Navbar";
import UserMenu from "./UserMenu";
import CartIcon from "../../cart/CartIcon";
import { useAuthStatus } from "../../../hooks/useAuthStatus";

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // استیت‌های موبایل
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null); // 'products' | 'vps' | null
  const { isLoggedIn, userName } = useAuthStatus();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileAccordion(null);
  };

  return (
    <header className="sticky top-0 z-50 font-[family-name:var(--font-farsi)] dir-rtl select-none bg-white transition-all duration-300">
      <div className="border-b-[3.5px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] overflow-visible">
        <div
          className={`max-w-7xl mx-auto flex items-stretch transition-all duration-300 relative overflow-visible ${
            isScrolled ? "h-14" : "h-16 md:h-20"
          }`}
        >
          {/* لوگوی دسکتاپ */}
          <Link
            href="/"
            className="hidden md:flex items-center justify-center w-60 bg-[#d1c4e9] border-x-[3.5px] border-black hover:bg-[#b39ddb] transition-colors relative overflow-visible"
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
              <span
                className={`absolute left-1 font-black text-black select-none pointer-events-none transition-all duration-300 -rotate-[38deg] ${
                  isScrolled ? "bottom-3 left-5 text-xl" : "bottom-6 text-2xl"
                }`}
              >
                لیمیت!
              </span>

              <Image
                src="/images/logo.png"
                alt="لوگوی بای لیمیت"
                width={160}
                height={120}
                priority
                className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300"
                style={{
                  height: isScrolled ? "75px" : "95px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(-3px 3px 0 rgba(0,0,0,1))",
                }}
              />

              <span
                className={`absolute right-2 font-black text-black select-none pointer-events-none transition-all duration-300 rotate-[40deg] ${
                  isScrolled ? "bottom-3 text-xl right-6" : "bottom-6 text-2xl"
                }`}
              >
                بای!
              </span>
            </div>
          </Link>

          {/* سرچ بار و منوهای دسکتاپ */}
          <div className="hidden md:flex items-center flex-1 justify-between">
            <SearchBar isScrolled={isScrolled} />
            <div className="flex items-stretch h-full">
              <CategoryDropdown
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                isScrolled={isScrolled}
              />
              <Navbar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
            </div>
          </div>

          {/* منوی کاربر دسکتاپ */}
          <div className="hidden md:flex border-l-[3.5px] border-black items-stretch">
            <UserMenu />
          </div>

          {/* هدر موبایل (تمیز و بدون دکمه اضافه) */}
          <div className="flex md:hidden items-center justify-between w-full px-3 overflow-visible h-full relative">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-[#ccff00] border-[2.5px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all z-10 cursor-pointer"
              aria-label="باز کردن منو"
            >
              <Menu className="w-6 h-6 text-black stroke-[2.5]" />
            </button>

            {/* لوگوی موبایل */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 translate-y-0.5 top-0 bottom-0 flex items-end justify-center w-52 overflow-visible pointer-events-auto z-20"
            >
              <span className="absolute left-3 bottom-3.5 font-black text-xl text-black select-none pointer-events-none -rotate-[40deg]">
                لیمیت!
              </span>

              <Image
                src="/images/logo.png"
                alt="لوگوی بای لیمیت"
                width={120}
                height={90}
                priority
                className="bottom-[-6px] relative pointer-events-none"
                style={{
                  height: "68px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(-2.5px 2.5px 0 rgba(0,0,0,1))",
                }}
              />

              <span className="absolute right-4 bottom-4 font-black text-xl text-black select-none pointer-events-none rotate-[40deg]">
                بای!
              </span>
            </Link>

            <CartIcon variant="mobile" />
          </div>
        </div>
      </div>

      {/* کشو و سایدبار منوی موبایل همراه با انیمیشن نرم Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* بک‌دراپ تاریک با انیمیشن Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* کشوی اصلی با انیمیشن نرم Slide-In از راست */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-[88%] max-w-[340px] bg-[#f3f3f3] border-l-[4px] border-black p-5 flex flex-col justify-between overflow-y-auto shadow-[-8px_0_0_0_rgba(0,0,0,1)]"
            >
              <div className="flex flex-col gap-4">
                {/* هدر کشو */}
                <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
                  <span className="font-black text-xl">منوی اصلی</span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-1.5 bg-white border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
                  >
                    <X className="w-6 h-6 stroke-[3]" />
                  </button>
                </div>

                {/* سرچ بار زنده بین محصولات در منوی موبایل */}
                <div className="w-full">
                  <SearchBar isScrolled={false} />
                </div>

                {/* لیست آکاردئونی مگامنو موبایل */}
                <div className="flex flex-col gap-3 mt-1">
                  {/* محصولات هوش مصنوعی */}
                  <div className="bg-white border-[2.5px] border-black rounded-xl overflow-hidden shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
                    <button
                      onClick={() =>
                        setMobileAccordion(
                          mobileAccordion === "products" ? null : "products",
                        )
                      }
                      className="w-full p-3 font-black text-sm flex items-center justify-between bg-[#ccff00] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>ابزارهای هوش مصنوعی</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${
                          mobileAccordion === "products" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileAccordion === "products" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-2 bg-white flex flex-col gap-1 border-t-[2px] border-black overflow-hidden"
                        >
                          <Link
                            href="/products/category/content-creation"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>تولید محتوا و متن</span>
                          </Link>

                          <Link
                            href="/products/category/coding-development"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Code2 className="w-4 h-4 text-emerald-600" />
                            <span>برنامه نویسی و توسعه نرم افزار</span>
                          </Link>

                          <Link
                            href="/products/category/image-editing"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <ImageIcon className="w-4 h-4 text-amber-600" />
                            <span>ساخت و ادیت عکس</span>
                          </Link>

                          <Link
                            href="/products/category/video-editing"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Video className="w-4 h-4 text-rose-600" />
                            <span>ساخت و ادیت ویدیو</span>
                          </Link>

                          <Link
                            href="/products/category/audio-music"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Music className="w-4 h-4 text-cyan-600" />
                            <span>ساخت صدا و موسیقی</span>
                          </Link>

                          <Link
                            href="/products/category/research-education"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                            <span>تحقیق و آموزش</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* سرور مجازی (VPS) */}
                  <div className="bg-white border-[2.5px] border-black rounded-xl overflow-hidden shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
                    <button
                      onClick={() =>
                        setMobileAccordion(
                          mobileAccordion === "vps" ? null : "vps",
                        )
                      }
                      className="w-full p-3 font-black text-sm flex items-center justify-between bg-[#12e2a3] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>سرور مجازی (VPS)</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${
                          mobileAccordion === "vps" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileAccordion === "vps" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-2 bg-white flex flex-col gap-1 border-t-[2px] border-black overflow-hidden"
                        >
                          <Link
                            href="/products?vps=germany"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <span>🇩🇪 سرور مجازی آلمان</span>
                          </Link>
                          <Link
                            href="/products?vps=usa"
                            onClick={closeMobileMenu}
                            className="p-2 text-xs font-black rounded-lg hover:bg-gray-100 flex items-center gap-2"
                          >
                            <span>🇺🇸 سرور مجازی آمریکا</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* خدمات و تماس */}
                  <Link
                    href="/services"
                    onClick={closeMobileMenu}
                    className="bg-white border-[2.5px] border-black p-3 rounded-xl font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-between"
                  >
                    <span>خدمات</span>
                    <Zap className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="bg-white border-[2.5px] border-black p-3 rounded-xl font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-between"
                  >
                    <span>تماس با ما</span>
                    <Headphones className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* بخش اختصاصی حساب کاربری / ورود در انتهای منوی همبرگری */}
              <div className="pt-4 border-t-[2.5px] border-black mt-4">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="w-full bg-[#12e2a3] border-[3px] border-black p-3.5 rounded-xl font-black text-center text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between no-underline text-black shrink-0 active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white border border-black rounded-md flex items-center justify-center font-black text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <span>{userName}</span>
                    </div>
                    <span className="text-xs bg-white border border-black px-2 py-0.5 rounded font-black">
                      پیشخوان
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    onClick={closeMobileMenu}
                    className="w-full bg-[#ff8f1f] border-[3px] border-black p-3.5 rounded-xl font-black text-center text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 no-underline text-black shrink-0 active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    <User className="w-5 h-5 stroke-[2.5]" />
                    <span>ورود | ثبت‌نام</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
