// src/components/product/LivePurchasePopup.jsx
"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const fakePurchases = [
  { name: "علی از تهران", time: "۲ دقیقه پیش", variant: "پلن اختصاصی ۱ ماهه" },
  {
    name: "رضا از شیراز",
    time: "۵ دقیقه پیش",
    variant: "پلن اشتراکی ۵ ظرفیتی",
  },
  {
    name: "سارا از اصفهان",
    time: "۱۲ دقیقه پیش",
    variant: "پلن اختصاصی ۳ ماهه",
  },
  { name: "محمد از مشهد", time: "۱۸ دقیقه پیش", variant: "پلن اشتراکی ۱ ماهه" },
];

export default function LivePurchasePopup() {
  const [purchase, setPurchase] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const random =
        fakePurchases[Math.floor(Math.random() * fakePurchases.length)];
      setPurchase(random);
      setShow(true);

      setTimeout(() => setShow(false), 5000);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-4 z-40 transition-all duration-500 transform ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      {purchase && (
        <div className="bg-white border-[2.5px] border-black p-3 rounded-xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3 max-w-xs">
          <div className="w-9 h-9 bg-[#ccff00] border-[2px] border-black rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-[11px] font-black leading-tight">
              {purchase.name} همین الان خرید کرد!
            </p>
            <p className="text-[10px] font-bold text-gray-600 mt-0.5">
              {purchase.variant} • {purchase.time}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
