"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

// نگاشت بخش‌های URL به برچسب فارسی
const SEGMENT_LABELS = {
  products:          "محصولات",
  services:          "خدمات",
  dashboard:         "پنل کاربری",
  orders:            "سفارش‌ها",
  profile:           "پروفایل",
  cart:              "سبد خرید",
  checkout:          "تسویه حساب",
  auth:              "ورود",
  contact:           "تماس با ما",
  about:             "درباره ما",
  faq:               "سوالات متداول",
  rules:             "قوانین",
  category:          null, // حذف می‌شود (نمایش ندارد)
  // دسته‌بندی‌های محصول
  text:              "تولید محتوا",
  code:              "برنامه‌نویسی",
  image:             "تولید تصویر",
  video:             "ویدیو",
  audio:             "صدا و موسیقی",
  research:          "تحقیق و آموزش",
  "film-music":      "فیلم و موسیقی",
  gaming:            "گیمینگ",
  "design-graphics": "طراحی و گرافیک",
  "seo-marketing":   "سئو و مارکتینگ",
  "education-utility":"آموزش و کاربردی",
  telegram:          "تلگرام",
  vps:               "سرور مجازی",
  "vps-germany":     "VPS آلمان",
  "vps-usa":         "VPS آمریکا",
  "vps-finland":     "VPS فنلاند",
};

/**
 * Breadcrumb هوشمند - خودکار از URL pathname می‌سازد.
 * استفاده: <Breadcrumb productTitle="نام محصول" /> (اختیاری)
 */
export default function Breadcrumb({ productTitle, className = "" }) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  // ساخت مسیر breadcrumb
  const crumbs = [{ label: "صفحه اصلی", href: "/" }];

  segments.forEach((seg, i) => {
    // حذف "category" از نمایش (نه از href)
    if (seg === "category") return;

    const href = "/" + segments.slice(0, i + 1).join("/");
    const rawLabel = SEGMENT_LABELS[seg];

    // آخرین بخش: اگر productTitle داده شده، از آن استفاده کن
    const isLast = i === segments.length - 1;
    const label =
      isLast && productTitle
        ? productTitle
        : rawLabel === undefined
        ? seg.replace(/-/g, " ") // Fallback: slug به کلمات
        : rawLabel;

    if (label === null) return; // SEGMENT_LABELS[seg] = null → حذف
    crumbs.push({ label, href });
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center flex-wrap gap-x-0.5 gap-y-1 text-[11px] font-bold text-gray-500 dir-rtl ${className}`}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        const isFirst = i === 0;
        return (
          <span key={crumb.href} className="flex items-center gap-x-0.5">
            {!isFirst && (
              <ChevronLeft className="w-3 h-3 shrink-0 text-gray-300 mx-0.5" />
            )}
            {isFirst && <Home className="w-3 h-3 shrink-0 text-gray-400 mx-0.5" />}
            {isLast ? (
              <span className="font-black text-black truncate max-w-[180px] sm:max-w-[260px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-black hover:underline transition-colors shrink-0"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
