// Frontend/src/components/layout/header/DollarBox.jsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/apiClient";

export default function DollarBox({ variant = "desktop" }) {
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
      className={
        variant === "mobile"
          ? "flex items-center justify-between px-3 py-2 bg-[#fff9c4] border-[2px] border-black rounded-lg w-full cursor-default select-none shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
          : "flex items-center gap-2 px-4 h-full border-l-[3.5px] border-black bg-[#fff9c4] hover:bg-[#fff59d] transition-colors shrink-0 cursor-default select-none"
      }
      title="نرخ لحظه‌ای دلار / تتر"
    >
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-gray-700 font-black text-sm">نرخ دلار:</span>
      </div>
      <div className="flex items-center gap-1.5 font-black text-sm">
        <span className="text-black dir-ltr tracking-tight font-black">
          {displayPrice.toLocaleString("fa-IR")}
        </span>
        <span className="text-[11px] font-bold text-gray-600">تومان</span>
      </div>
    </div>
  );
}