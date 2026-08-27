// src/components/product/ProductReviews.jsx
"use client";

import { Star, CheckCircle2 } from "lucide-react";

export default function ProductReviews({ reviews, average, count }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b-[2px] border-black pb-4">
        <div>
          <h3 className="text-base font-black">نظرات خریداران واقعی</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            امتیاز کل: {average} از ۵ (بر اساس {count} نظر ثبت‌شده)
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border-[2.5px] border-black p-4 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs md:text-sm">
                  {rev.userName}
                </span>
                {rev.isVerifiedBuyer && (
                  <span className="bg-[#12e2a3] border-[1px] border-black text-black px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    خریدار تاییدشده
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating
                        ? "fill-amber-400 text-black stroke-[1.5]"
                        : "text-gray-300 stroke-[1]"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-800 leading-relaxed">
              {rev.comment}
            </p>
            <span className="text-[10px] font-bold text-gray-400 self-end">
              {rev.createdAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
