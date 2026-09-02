// src/components/layout/header/UserMenu.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isLoggedIn = !!user;
  const userName = user?.fullName || user?.mobile || "کاربر";

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <div className="relative flex items-stretch">
      {isLoggedIn ? (
        <div
          className="relative flex items-stretch"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button className="flex items-center gap-2 px-5 bg-[#12e2a3] hover:bg-[#0fd196] font-black text-sm md:text-base text-black transition-colors cursor-pointer">
            <div className="w-7 h-7 bg-white border-[1.5px] border-black rounded-lg flex items-center justify-center font-black text-xs shadow-[-1.5px_1.5px_0_0_rgba(0,0,0,1)]">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>{userName}</span>
            <ChevronDown className={`w-4 h-4 stroke-[3] transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 w-52 bg-white border-[3.5px] border-black rounded-b-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] p-2 flex flex-col gap-1 z-50">
              <div className="p-2 border-b-[2px] border-black mb-1">
                <span className="text-[10px] font-bold text-gray-500 block">خوش آمدید،</span>
                <span className="text-xs font-black text-black">{userName}</span>
              </div>
              <Link href="/dashboard" onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2.5 font-black text-xs hover:bg-[#ccff00] rounded-lg border border-transparent hover:border-black transition-all">
                <LayoutDashboard className="w-4 h-4" />
                <span>ورود به پیشخوان</span>
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 p-2.5 font-black text-xs text-rose-700 hover:bg-rose-100 rounded-lg border border-transparent hover:border-black transition-all text-right w-full cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/auth"
          className="flex items-center gap-2 px-6 bg-[#ffb74d] hover:bg-[#ffa726] font-black text-base text-black transition-colors no-underline">
          <User className="w-5 h-5 stroke-[2.5]" />
          <span>ورود | ثبت نام</span>
        </Link>
      )}
    </div>
  );
}
