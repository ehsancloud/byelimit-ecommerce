// src/components/layout/header/DollarBox.jsx
"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { apiFetch } from "../../../lib/apiClient";

export default function DollarBox() {
  const [displayPrice, setDisplayPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    try {
      const data = await apiFetch("/api/payment/usd-rate", { silent404: true });
      if (data?.displayPrice) setDisplayPrice(Math.round(data.displayPrice));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRate();
    const timer = setInterval(fetchRate, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !displayPrice) return null;

  return (
    <div className="flex items-center gap-1.5 bg-[#fff9c4] border-[2px] border-black rounded-lg px-2.5 py-1 text-[11px] font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] shrink-0" title="نرخ لحظه‌ای دلار / تتر">
      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
      <span className="text-gray-600">دلار:</span>
      <span className="text-black dir-ltr">{displayPrice.toLocaleString("fa-IR")}</span>
      <span className="text-gray-500">ت</span>
    </div>
  );
}
