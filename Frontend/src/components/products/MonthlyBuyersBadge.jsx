// src/components/products/MonthlyBuyersBadge.jsx
// نمایش: "نفر N‌ام این ماه این محصول را بخرید"
// از فیلد monthlySalesCount محصول استفاده می‌کند

import { Users } from "lucide-react";

/**
 * @param {number} monthlySalesCount - تعداد فروش این ماه از بک‌اند
 * @param {string} className
 */
export default function MonthlyBuyersBadge({ monthlySalesCount = 0, className = "" }) {
  if (!monthlySalesCount || monthlySalesCount < 1) return null;

  const nextBuyer = monthlySalesCount + 1;

  // تبدیل عدد به فارسی (ساده)
  const toFa = (n) =>
    String(n).replace(/0/g,"۰").replace(/1/g,"۱").replace(/2/g,"۲").replace(/3/g,"۳")
              .replace(/4/g,"۴").replace(/5/g,"۵").replace(/6/g,"۶").replace(/7/g,"۷")
              .replace(/8/g,"۸").replace(/9/g,"۹");

  return (
    <div className={`inline-flex items-center gap-2 bg-[#fff9c4] border-[2px] border-black px-3 py-2 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] ${className}`}>
      <Users className="w-4 h-4 text-orange-500 shrink-0 stroke-[2.5]" />
      <span>
        نفر <span className="text-orange-600">{toFa(nextBuyer)}ام</span> این ماه باشید که این محصول را می‌خرید!
      </span>
    </div>
  );
}
