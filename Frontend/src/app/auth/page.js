// Frontend/src/app/auth/page.js
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

  // مرحله ۱: شماره موبایل | مرحله ۲: کد OTP پنج رقمی
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // شمارش معکوس ارسال مجدد پیامک
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

  // درخواست ارسال کد OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMobileError("");

    // تبدیل ارقام فارسی و عربی به انگلیسی
    let cleanMobile = mobile.trim()
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

    if (!/^09\d{9}$/.test(cleanMobile)) {
      setMobileError("لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند 09123456789) وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      setMobile(cleanMobile);
      setStep(2);
      setTimer(120);
      setOtpCode(["", "", "", "", ""]);
    } catch (err) {
      setMobileError(err.message || "ارسال کد ناموفق بود. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // مدیریت تغییر اینپوت‌ها از چپ به راست (۵ کادر)
  const handleOtpChange = (e, index) => {
    let value = e.target.value;
    // تبدیل ارقام فارسی یا عربی
    value = value
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

    if (value && isNaN(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1);
    setOtpCode(newOtp);
    setOtpError("");

    // انتقال خودکار فوکوس به خانه بعدی (تا ۴ خانه اول)
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // مدیریت کلید Backspace برای برگشت به کادر قبلی
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // پشتیبانی از Paste مستقیم کد ۵ رقمی
  const handleOtpPaste = (e) => {
    e.preventDefault();
    let pastedData = e.clipboardData.getData("text").trim();
    pastedData = pastedData
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

    if (/^\d{5}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpCode(digits);
      const lastInput = document.getElementById("otp-input-4");
      if (lastInput) lastInput.focus();
    }
  };

  // تایید کد و ورود
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    const fullCode = otpCode.join("");

    if (fullCode.length < 5) {
      setOtpError("لطفاً کد تایید ۵ رقمی را به صورت کامل وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, code: fullCode }),
      });

      if (result.user) {
        login(result.user, result.token);
      }

      router.push(redirectTo);
    } catch (err) {
      setOtpError(err.message || "کد تایید نادرست یا منقضی شده است.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none flex items-center justify-center">
      <div className="w-full max-w-md bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)]">

        {/* هدر */}
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
          /* مرحله ۱: شماره موبایل */
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
                اگر با این شماره قبلاً خریدی انجام داده‌اید، سفارش‌ها به طور خودکار به این حساب متصل می‌شوند.
              </span>
            </div>
          </form>
        ) : (
          /* مرحله ۲: ۵ کادر کد تایید */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black mb-1">کد تایید را وارد کنید</h1>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-black text-purple-600 hover:underline cursor-pointer"
                >
                  تغییر شماره
                </button>
              </div>
              <p className="text-xs font-bold text-gray-600">
                کد ۵ رقمی پیامک‌شده به شماره <span className="font-black text-black dir-ltr">{mobile}</span> را وارد فرمایید:
              </p>
            </div>

            {/* چیدمان افقی ۵ خانه کد از چپ به راست */}
            <div
              style={{ direction: "ltr" }}
              className="flex items-center justify-center gap-2 sm:gap-2.5 my-2"
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
                  className="w-11 sm:w-12 h-14 bg-[#f8f9fa] border-[2.5px] border-black rounded-xl text-center text-xl font-black outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
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
                <span className="font-black text-black dir-ltr">{Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</span>
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