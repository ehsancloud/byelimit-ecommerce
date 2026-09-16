// Frontend/src/components/home/AnnouncementBanner.jsx
"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";

export default function AnnouncementBanner() {
  const [text, setText] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/announcement", { silent404: true })
      .then((data) => {
        if (!cancelled && data?.text && String(data.text).trim().length > 0) {
          setText(String(data.text).trim());
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // اگر متن null یا خالی بود کلا رندر نشود
  if (!text) return null;

  return (
    <div className="w-full bg-[#ff4757] text-white border-[3px] border-black rounded-xl p-2.5 sm:p-3 shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 text-xs sm:text-sm font-black select-none dir-rtl text-center">
      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
      <span>{text}</span>
    </div>
  );
}
