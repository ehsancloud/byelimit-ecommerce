"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

const SEGMENT_LABELS = {
  products: "فروشگاه", services: "خدمات", dashboard: "پنل کاربری",
  orders: "سفارش ها", profile: "پروفایل", cart: "سبد خرید",
  checkout: "تسویه حساب", auth: "ورود", contact: "تماس با ما",
  about: "درباره ما", faq: "سوالات متداول", rules: "قوانین",
  category: null,
  text: "تولید محتوا", code: "برنامه نویسی", image: "تولید تصویر",
  video: "ویدیو", audio: "صدا و موسیقی", research: "تحقیق و آموزش",
  "film-music": "فیلم و موسیقی", gaming: "گیمینگ",
  "design-graphics": "طراحی و گرافیک", "seo-marketing": "سئو و مارکتینگ",
  "education-utility": "آموزش و کاربردی", telegram: "تلگرام",
  vps: "سرور مجازی", "vps-germany": "VPS آلمان",
  "vps-usa": "VPS آمریکا", "vps-finland": "VPS فنلاند",
};

export default function Breadcrumb({ productTitle, className = "" }) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "خانه", href: "/" }];

  segments.forEach((seg, i) => {
    if (seg === "category") return;
    const href = "/" + segments.slice(0, i + 1).join("/");
    const rawLabel = SEGMENT_LABELS[seg];
    const isLast = i === segments.length - 1;
    const label = isLast && productTitle ? productTitle
      : rawLabel === undefined ? seg.replace(/-/g, " ") : rawLabel;
    if (label === null) return;
    crumbs.push({ label, href });
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="breadcrumb"
      className={`inline-flex items-center flex-wrap gap-1 dir-rtl ${className}`}>
      <div className="flex items-center flex-wrap gap-1 bg-white border-[2px] border-black rounded-xl px-3 py-1.5 md:px-4 md:py-2 shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1">
              {i === 0 && <Home className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-gray-600" />}
              {isLast ? (
                <span className="text-xs md:text-sm font-black text-black truncate max-w-[160px] sm:max-w-none">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-xs md:text-sm font-bold text-gray-500 hover:text-black transition-colors shrink-0 hover:underline">
                  {crumb.label}
                </Link>
              )}
              {!isLast && <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-gray-400" />}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
