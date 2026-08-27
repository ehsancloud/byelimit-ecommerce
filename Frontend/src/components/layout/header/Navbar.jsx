// src/components/layout/header/Navbar.jsx
"use client";

import Link from "next/link";
import { ChevronDown, Zap, Code, ShieldCheck } from "lucide-react";
import CartIcon from "../../cart/CartIcon";

export default function Navbar({ activeMenu, setActiveMenu }) {
  return (
    <nav className="hidden md:flex items-stretch">
      {/* منوی خدمات */}
      <div
        className="relative flex items-stretch"
        onMouseEnter={() => setActiveMenu("services")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <button
          className={`flex items-center gap-2 px-6 border-l-[3.5px] border-black font-black text-base transition-colors ${
            activeMenu === "services"
              ? "bg-[#12e2a3]"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          <span>خدمات</span>
          <ChevronDown className="w-4 h-4 stroke-[3]" />
        </button>

        {activeMenu === "services" && (
          <div className="absolute top-full right-0 w-56 bg-white border-[3.5px] border-black rounded-b-[16px] shadow-[-6px_6px_0_0_rgba(0,0,0,1)] p-2 flex flex-col gap-1 z-50">
            <Link
              href="/services/charge"
              className="p-2.5 font-black text-sm hover:bg-[#ccff00] rounded-lg border border-transparent hover:border-black"
            >
              شارژ اختصاصی اکانت
            </Link>
            <Link
              href="/services/api"
              className="p-2.5 font-black text-sm hover:bg-[#ccff00] rounded-lg border border-transparent hover:border-black"
            >
              خرید API اختصاصی
            </Link>
          </div>
        )}
      </div>

      <CartIcon variant="desktop" />
    </nav>
  );
}
