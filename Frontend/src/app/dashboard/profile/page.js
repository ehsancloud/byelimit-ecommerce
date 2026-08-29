"use client";

import { useState, useEffect } from "react";
import { User, Phone, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "../../../lib/apiClient";

export default function DashboardProfilePage() {
  const [profile, setProfile] = useState({ fullName: "", mobile: "", telegramId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIX: دریافت واقعی پروفایل از بک‌اند
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((data) => {
        const u = data?.user || {};
        setProfile({
          fullName:   u.fullName   || "",
          mobile:     u.mobile     || "",
          telegramId: u.telegramId || "",
        });
      })
      .catch(() => setError("خطا در دریافت اطلاعات پروفایل."))
      .finally(() => setLoading(false));
  }, []);

  // ✅ FIX: ذخیره واقعی پروفایل در بک‌اند (به‌جای setSaved تقلبی)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName:   profile.fullName.trim() || null,
          telegramId: profile.telegramId.trim() || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "خطا در ذخیره‌سازی پروفایل.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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

      {error && (
        <div className="bg-rose-50 border-[2.5px] border-rose-400 p-3.5 rounded-xl text-xs font-black flex items-center gap-2 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
        {/* نام */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-600" />
            <span>نام و نام خانوادگی</span>
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            placeholder="مثلاً: علی رضایی"
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
          />
        </div>

        {/* شماره موبایل - غیرقابل ویرایش */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>شماره همراه (غیرقابل تغییر)</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400">شناسه اصلی حساب</span>
          </label>
          <input
            type="tel"
            value={profile.mobile}
            disabled
            className="bg-gray-100 border-[2.5px] border-gray-300 rounded-xl p-3 text-sm font-bold outline-none text-gray-500 cursor-not-allowed dir-ltr"
          />
        </div>

        {/* آیدی تلگرام */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-500" />
            <span>آیدی تلگرام (اختیاری)</span>
          </label>
          <input
            type="text"
            value={profile.telegramId}
            onChange={(e) => setProfile({ ...profile, telegramId: e.target.value })}
            placeholder="مثلاً: @username"
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all dir-ltr"
          />
          <p className="text-[11px] font-bold text-gray-500 pr-1">
            جهت ارسال اطلاعات اکانت از طریق تلگرام
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black hover:bg-gray-800 text-white border-[2.5px] border-black py-3 rounded-xl font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>در حال ذخیره...</span></>
          ) : (
            <span>ذخیره تغییرات</span>
          )}
        </button>
      </form>
    </div>
  );
}
