// src/app/auth/page.js
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

// Next.js نیازمند این است که هر کامپوننتی که از useSearchParams استفاده می‌کند
// داخل یک Suspense boundary باشد - این باگ build از قبل در پروژه وجود داشت.
export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();

  // استیت‌های ورود (مرحله ۱: دریافت شماره / مرحله ۲: دریافت کد OTP)
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(120); // تایمر ۲ دقیقه‌ای
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تایمر معکوس برای ارسال مجدد کد
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ارسال شماره موبایل و درخواست کد OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMobileError("");
    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setMobileError("لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند 09123456789) وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile }),
      });
      setStep(2);
      setTimer(120);
    } catch (err) {
      setMobileError(err.message || "ارسال کد ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // تغییر هوشمند اینپوت‌های کد OTP از چپ به راست
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otpCode];
    // نگه‌داشتن آخرین رقم واردشده
    newOtp[index] = value.substring(value.length - 1);
    setOtpCode(newOtp);
    setOtpError("");

    // حرکت به خانه بعدی (سمت راست‌تر در ظاهر LTR)
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // مدیریت کلید Backspace برای برگشت به خانه قبلی
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // پشتیبانی از Paste کپی‌کردن کامل کد ۴ رقمی
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpCode(digits);
      const lastInput = document.getElementById("otp-input-3");
      if (lastInput) lastInput.focus();
    }
  };

  // تایید کد OTP و ورود به حساب
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    const fullCode = otpCode.join("");
    if (fullCode.length < 4) {
      setOtpError("لطفاً کد تایید ۴ رقمی را کامل وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      // بک‌اند خودش کوکی auth_token را به‌صورت httpOnly ست می‌کند (از طریق
      // Set-Cookie روی پاسخ) - فرانت‌اند دیگر نیازی به دستکاری document.cookie ندارد.
      const result = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, code: fullCode }),
      });
      login(result.user, result.token);
      router.push(redirectTo);
    } catch (err) {
      setOtpError(err.message || "کد تایید نادرست یا منقضی است.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none flex items-center justify-center">
      <div className="w-full max-w-md bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)]">

        {/* هدر مودال ورود */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ccff00] border-[2px] border-black rounded-lg flex items-center justify-center shadow-[-2px_2px_0_0_rgba(0,0,0,1)] font-black text-xs">
              BL
            </div>
            <span className="font-black text-lg">ورود | ثبت‌نام سریع</span>
          </div>

          <Link
            href="/"
            className="p-1.5 bg-gray-100 hover:bg-gray-200 border-[2px] border-black rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
          >
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

        {step === 1 ? (
          /* ================= مرحله ۱: ورود شماره موبایل ================= */
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <div>
              <h1 className="text-xl font-black mb-1">شماره موبایل خود را وارد کنید</h1>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                کد تایید یک‌بارمصرف (OTP) به این شماره پیامک خواهد شد.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-black flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>شماره همراه</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="09123456789"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`w-full bg-[#f8f9fa] border-[2.5px] rounded-xl p-3.5 text-sm font-black text-right outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all ${
                  mobileError ? "border-rose-500" : "border-black"
                }`}
              />
              {mobileError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {mobileError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-3.5 font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
            >
              <span>{isSubmitting ? "در حال ارسال کد..." : "دریافت کد تایید"}</span>
              <ArrowRight className="w-4 h-4 rotate-180 stroke-[3]" />
            </button>

            <div className="bg-[#fff9c4] border-[2px] border-black p-3 rounded-xl flex items-start gap-2 text-[11px] font-bold text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                اگر با این شماره قبلاً خریدی انجام داده‌اید، به صورت اتوماتیک تمام فاکتورهای شما به این حساب متصل می‌شوند.
              </span>
            </div>
          </form>
        ) : (
          /* ================= مرحله ۲: ورود کد OTP ================= */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black mb-1">کد تایید را وارد کنید</h1>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-black text-purple-600 hover:underline"
                >
                  تغییر شماره
                </button>
              </div>
              <p className="text-xs font-bold text-gray-600">
                کد ۴ رقمی ارسال‌شده به شماره <span className="font-black text-black dir-ltr">{mobile}</span> را وارد کنید:
              </p>
            </div>

            {/* کانتینر صریح LTR با استایل مستقیم برای تضمین چیدمان از چپ به راست */}
            <div
              style={{ direction: "ltr" }}
              className="flex items-center justify-center gap-3 my-2"
            >
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  onFocus={(e) => e.target.select()}
                  style={{ direction: "ltr" }}
                  className="w-12 h-14 bg-[#f8f9fa] border-[2.5px] border-black rounded-xl text-center text-xl font-black outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 justify-center -mt-3">
                <AlertCircle className="w-3.5 h-3.5" />
                {otpError}
              </p>
            )}

            {/* تایمر ارسال مجدد */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>ارسال مجدد کد:</span>
              {timer > 0 ? (
                <span className="font-black text-black">{Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-purple-600 font-black hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ارسال مجدد پیامک</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#12e2a3] hover:bg-[#0fd196] border-[3px] border-black rounded-xl py-3.5 font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
            >
              <span>{isSubmitting ? "در حال اعتبارسنجی..." : "تایید و ورود به پنل"}</span>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
