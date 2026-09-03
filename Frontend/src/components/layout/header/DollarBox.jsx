// Frontend/src/components/layout/header/DollarBox.jsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/apiClient";

export default function DollarBox() {
  const [displayPrice, setDisplayPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    try {
      const data = await apiFetch("/api/payment/usd-rate", { silent404: true });
      if (data?.displayPrice && Number(data.displayPrice) > 10000) {
        setDisplayPrice(Math.round(Number(data.displayPrice)));
      }
    } catch {
      /* سایلنت */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    const timer = setInterval(fetchRate, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-2 px-4 h-full border-l-[3.5px] border-black bg-[#fff9c4] hover:bg-[#fff59d] transition-colors shrink-0 cursor-default select-none"
      title="نرخ لحظه‌ای دلار / تتر (بروزرسانی خودکار هر ۱۵ دقیقه)"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <div className="flex items-center gap-1.5 font-black text-sm">
        <span className="text-gray-700">نرخ دلار:</span>
        {loading || !displayPrice ? (
          <span className="text-gray-400 text-xs font-bold animate-pulse">در حال استعلام...</span>
        ) : (
          <>
            <span className="text-black dir-ltr tracking-tight font-black">
              {displayPrice.toLocaleString("fa-IR")}
            </span>
            <span className="text-[11px] font-bold text-gray-600">تومان</span>
          </>
        )}
      </div>
    </div>
  );
}