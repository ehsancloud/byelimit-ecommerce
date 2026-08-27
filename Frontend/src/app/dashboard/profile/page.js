// src/app/dashboard/profile/page.js
"use client";

import { useState } from "react";
import { User, Phone, Send, Mail, CheckCircle2 } from "lucide-react";

export default function DashboardProfilePage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "محمد حسام",
    mobile: "09123456789",
    telegramId: "@hesam_dev",
    email: "hesam@example.com",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
      <div className="border-b-[3px] border-black pb-4">
        <h1 className="text-xl md:text-2xl font-black">تنظیمات پروفایل و حساب کاربری</h1>
        <p className="text-xs font-bold text-gray-600 mt-1">
          ویرایش مشخصات شخصی جهت دریافت اطلاعیه‌ها و تحویل اشتراک‌ها.
        </p>
      </div>

      {saved && (
        <div className="bg-[#12e2a3] border-[2.5px] border-black p-3.5 rounded-xl text-xs font-black flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>اطلاعات پروفایل شما با موفقیت بروزرسانی شد.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-600" />
            <span>نام و نام خانوادگی</span>
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-xs font-bold outline-none focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>شماره همراه (غیرقابل تغییر)</span>
            </span>
          </label>
          <input
            type="tel"
            disabled
            value={profile.mobile}
            className="bg-gray-100 border-[2.5px] border-gray-400 rounded-xl p-3 text-xs font-black text-gray-500 dir-ltr text-right cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-500" />
            <span>آیدی تلگرام جهت دریافت سریع اکانت‌ها</span>
          </label>
          <input
            type="text"
            dir="ltr"
            value={profile.telegramId}
            onChange={(e) => setProfile({ ...profile, telegramId: e.target.value })}
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-xs font-black text-right outline-none focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>ایمیل (جهت ارسال فاکتور)</span>
          </label>
          <input
            type="email"
            dir="ltr"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-xs font-black text-right outline-none focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="self-start bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl px-6 py-3 font-black text-xs shadow-[-4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer text-black"
        >
          ذخیره تغییرات پروفایل
        </button>
      </form>
    </div>
  );
}