// Frontend/src/components/layout/header/DollarBox.jsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/apiClient";

export default function DollarBox() {
  const [displayPrice, setDisplayPrice] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("byelimit_usd_rate");
      if (cached && Number(cached) > 10000) return Number(cached);
    }
    return 217100;
  });

  const fetchRate = async () => {
    try {
      const data = await apiFetch("/api/payment/usd-rate", { silent404: true });
      if (data?.displayPrice && Number(data.displayPrice) > 10000) {
        const val = Math.round(Number(data.displayPrice));
        setDisplayPrice(val);
        if (typeof window !== "undefined") {
          localStorage.setItem("byelimit_usd_rate", String(val));
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchRate();
    const timer = setInterval(fetchRate, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-2 px-4 h-full border-x-[3.5px] border-black bg-[#fff9c4] hover:bg-[#fff59d] transition-colors shrink-0 cursor-default select-none"
      title="نرخ لحظه‌ای دلار / تتر"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <div className="flex items-center gap-1.5 font-black text-sm">
        <span className="text-gray-700">نرخ دلار:</span>
        <span className="text-black dir-ltr tracking-tight font-black">
          {displayPrice.toLocaleString("fa-IR")}
        </span>
        <span className="text-[11px] font-bold text-gray-600">تومان</span>
      </div>
    </div>
  );
}