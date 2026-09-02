"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck, ArrowRight, Send, Phone, User, Tag, CreditCard,
  Lock, Clock, AlertCircle, CheckCircle2, ShoppingCart, Loader2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../lib/apiClient";
import { formatPriceToman } from "../../lib/formatters";

const STEPS = [
  { key: "info",    label: "اطلاعات خریدار"    },
  { key: "invoice", label: "پیش‌فاکتور و پرداخت" },
];

function StepIndicator({ currentKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);
  return (
    <div className="flex items-center gap-1.5 md:gap-2 mb-6">
      {STEPS.map((step, index) => {
        const isDone   = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-1.5 md:gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[2px] border-black text-[10px] md:text-xs font-black ${
              isActive ? "bg-[#ccff00]" : isDone ? "bg-[#12e2a3]" : "bg-white text-gray-400"
            }`}>
              <span>{index + 1}. {step.label}</span>
            </div>
            {index < STEPS.length - 1 && <div className="w-4 md:w-6 h-[2px] bg-black" />}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// انتخاب درگاه پرداخت
// ═══════════════════════════════════════════════════════════════

function GatewaySelector({ selected, onChange }) {
  const gateways = [
    {
      id: "ZIBAL",
      name: "زیبال",
      label: "درگاه پرداخت زیبال",
      enabled: true,
      logo: "https://zibal.ir/trust/assets/2.png",
    },
    {
      id: "ZARINPAL",
      name: "زرین‌پال",
      label: "درگاه پرداخت زرین‌پال",
      enabled: false,
      logo: "https://cdn.zarinpal.com/assets/img/logo.png",
    },
  ];

  return (
    <div className="flex flex-col gap-2 mt-3">
      <span className="text-xs font-black text-black">درگاه پرداخت مورد نظر را انتخاب کنید:</span>
      <div className="grid grid-cols-2 gap-3">
        {gateways.map((gw) => {
          const isSelected = selected === gw.id;
          return (
            <button
              key={gw.id}
              type="button"
              disabled={!gw.enabled}
              onClick={() => gw.enabled && onChange(gw.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-[2.5px] border-black transition-all ${
                isSelected
                  ? "bg-[#12e2a3] shadow-[-3px_3px_0_0_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                  : gw.enabled
                    ? "bg-white hover:bg-gray-50 shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
                    : "bg-gray-100 opacity-50 cursor-not-allowed"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gw.logo}
                alt={gw.name}
                className="h-8 object-contain"
              />
              <span className="text-[11px] font-black">{gw.label}</span>
              {!gw.enabled && (
                <span className="text-[9px] font-bold text-gray-400">به‌زودی فعال می‌شود</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// صفحه اصلی چک‌اوت
// ═══════════════════════════════════════════════════════════════

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice: cartTotalPrice, isHydrated } = useCart();

  const [formData, setFormData] = useState({ fullName: "", mobile: "", telegramId: "" });
  const [mobileError, setMobileError] = useState("");
  const [step, setStep] = useState("info");

  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("ZIBAL");

  const [discountCode, setDiscountCode]               = useState("");
  const [appliedOrderDiscount, setAppliedOrderDiscount] = useState(0);
  const [discountError, setDiscountError]             = useState("");
  const [discountSuccess, setDiscountSuccess]         = useState("");

  const totalPrice = useMemo(() => {
    const final = cartTotalPrice - appliedOrderDiscount;
    return final > 0 ? final : 0;
  }, [cartTotalPrice, appliedOrderDiscount]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !pendingOrderId) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, pendingOrderId, router]);

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    setDiscountError("");
    setDiscountSuccess("");
    try {
      const quote = await apiFetch("/api/orders/quote", {
        method: "POST",
        body: JSON.stringify({ orderLevelDiscountCode: discountCode }),
      });
      setDiscountCode(quote.appliedCode || discountCode.trim().toUpperCase());
      setAppliedOrderDiscount(quote.discountToman);
      setDiscountSuccess("کد تخفیف با موفقیت روی کل سبد اعمال شد.");
    } catch (err) {
      setDiscountError(err.message || "کد تخفیف معتبر نیست.");
    }
  };

  const handleContinueToInvoice = (e) => {
    e.preventDefault();
    setMobileError("");
    if (!/^09\d{9}$/.test(formData.mobile)) {
      setMobileError("لطفاً شماره موبایل معتبر ۱۱ رقمی وارد کنید.");
      return;
    }
    setStep("invoice");
  };

  const handleGoToGateway = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let orderId = pendingOrderId;

      if (!orderId) {
        const orderResult = await apiFetch("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            mobile: formData.mobile,
            telegramId: formData.telegramId || null,
            fullName: formData.fullName || null,
            orderLevelDiscountCode: appliedOrderDiscount > 0 ? discountCode : null,
          }),
        });
        orderId = orderResult.orderId;
        setPendingOrderId(orderId);
      }

      const paymentResult = await apiFetch("/api/payment/request", {
        method: "POST",
        body: JSON.stringify({ orderId, gateway: selectedGateway }),
      });

      if (!paymentResult?.startPayUrl) {
        throw new Error("آدرس درگاه پرداخت دریافت نشد. لطفاً چند لحظه صبر کرده و دوباره تلاش کنید.");
      }

      window.location.href = paymentResult.startPayUrl;

    } catch (err) {
      setSubmitError(err.message || "خطا در اتصال به درگاه. لطفاً دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-6">
        <div className="flex items-center gap-2 font-black text-sm">
          <ShoppingCart className="w-5 h-5 animate-pulse" />
          <span>در حال بارگذاری...</span>
        </div>
      </main>
    );
  }

  if (items.length === 0 && !pendingOrderId) return null;

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black select-none">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b-[3.5px] border-black pb-4 mb-4">
          <Link href="/cart" className="flex items-center gap-1.5 bg-white border-[2.5px] border-black px-3 py-1.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 transition-all">
            <ArrowRight className="w-4 h-4 stroke-[3]" />
            <span>بازگشت به سبد خرید</span>
          </Link>
          <span className="bg-[#ccff00] border-[2px] border-black px-3 py-1 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">تسویه حساب</span>
        </div>

        <StepIndicator currentKey={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">

            {step === "info" ? (
              /* ─── مرحله ۱: فرم اطلاعات ─── */
              <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="border-b-[3px] border-black pb-4 mb-6">
                  <h1 className="text-xl md:text-2xl font-black">اطلاعات خریدار</h1>
                  <p className="text-xs font-bold text-gray-600 mt-1">جهت صدور پیش‌فاکتور و تحویل سریع، مشخصات زیر را وارد کنید.</p>
                </div>

                <form onSubmit={handleContinueToInvoice} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-black flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      <span>شماره موبایل (ضروری)</span>
                    </label>
                    <input type="tel" required dir="ltr" placeholder="09123456789"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className={`w-full bg-[#f8f9fa] border-[2.5px] rounded-xl p-3.5 text-sm font-black outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all text-right ${mobileError ? "border-rose-500" : "border-black"}`}
                    />
                    {mobileError && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />{mobileError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-black flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-blue-500 stroke-[2.5]" />
                      <span>آیدی یا شماره تلگرام (جهت پیگیری سریع‌تر)</span>
                    </label>
                    <input type="text" dir="ltr" placeholder="@username یا 0912..."
                      value={formData.telegramId}
                      onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                      className="w-full bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-black outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all text-right"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-black flex items-center gap-1.5">
                      <User className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                      <span>نام و نام خانوادگی (اختیاری)</span>
                    </label>
                    <input type="text" placeholder="مثال: محمد حسام"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3.5 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
                    />
                  </div>

                  <button type="submit"
                    className="mt-3 w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-4 font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>تایید اطلاعات و مشاهده پیش‌فاکتور</span>
                    <ArrowRight className="w-5 h-5 rotate-180 stroke-[3]" />
                  </button>
                </form>
              </div>
            ) : (
              /* ─── مرحله ۲: پیش‌فاکتور و پرداخت ─── */
              <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
                <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
                  <div>
                    <span className="inline-block bg-[#12e2a3] border-[1.5px] border-black px-2.5 py-0.5 rounded text-[11px] font-black mb-1">پیش‌فاکتور آماده است</span>
                    <h2 className="text-xl font-black">پیش‌فاکتور خرید</h2>
                  </div>
                  {!pendingOrderId && (
                    <button onClick={() => setStep("info")}
                      className="text-xs font-black text-gray-600 hover:underline bg-gray-100 border border-black px-2.5 py-1 rounded-lg cursor-pointer"
                    >ویرایش مشخصات</button>
                  )}
                </div>

                <div className="bg-[#f8f9fa] border-[2.5px] border-black p-4 rounded-xl flex flex-col gap-2 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">شماره موبایل خریدار:</span>
                    <span className="font-black text-black">{formData.mobile}</span>
                  </div>
                  {formData.telegramId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">آیدی تلگرام:</span>
                      <span className="font-black text-black">{formData.telegramId}</span>
                    </div>
                  )}
                </div>

                {!pendingOrderId && (
                  <form onSubmit={handleApplyDiscount} className="flex flex-col gap-2">
                    <label className="text-xs font-black text-black flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                      <span>کد تخفیف دارید؟</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="text" dir="ltr" placeholder="مثال: SAVE50"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={appliedOrderDiscount > 0}
                        className="flex-1 bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-2.5 text-xs font-black outline-none focus:bg-white uppercase disabled:opacity-60"
                      />
                      <button type="submit" disabled={appliedOrderDiscount > 0}
                        className="bg-[#12e2a3] border-[2.5px] border-black px-4 py-2.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-60"
                      >اعمال</button>
                    </div>
                    {discountError && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{discountError}</p>}
                    {discountSuccess && <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5" />{discountSuccess}</p>}
                  </form>
                )}

                {/* انتخاب درگاه پرداخت */}
                {!pendingOrderId && (
                  <GatewaySelector selected={selectedGateway} onChange={setSelectedGateway} />
                )}

                {/* دکمه پرداخت */}
                <button type="button" onClick={handleGoToGateway} disabled={isSubmitting}
                  className="w-full bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-xl py-4 font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>در حال اتصال به درگاه...</span></>
                  ) : (
                    <><CreditCard className="w-5 h-5 stroke-[2.5]" /><span>{pendingOrderId ? "تلاش مجدد برای پرداخت" : "پرداخت نهایی"}</span></>
                  )}
                </button>

                {submitError && (
                  <div className="bg-rose-50 border-[2px] border-rose-400 rounded-xl p-3 text-[12px] font-bold text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 justify-center">
                  <Lock className="w-3.5 h-3.5" />
                  <span>پرداخت امن از طریق درگاه رسمی زیبال</span>
                </div>
              </div>
            )}
          </div>

          {/* ─── خلاصه سفارش (ستون راست) ─── */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4">
              <h3 className="font-black text-base border-b-[2.5px] border-black pb-3">خلاصه سفارش شما</h3>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between gap-3 text-xs font-bold">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.imageSrc && (
                        <div className="w-10 h-10 relative border-[1.5px] border-black rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image src={item.imageSrc} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-black truncate">{item.title}</p>
                        <p className="text-gray-500 truncate">{item.variantName}</p>
                        {item.addOnName && (
                          <p className="text-purple-700 truncate">+ {item.addOnName}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-black shrink-0">{formatPriceToman(item.price)} ت</span>
                  </div>
                ))}
              </div>
              <div className="border-t-[2px] border-black pt-3 flex flex-col gap-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-gray-600">جمع کل:</span>
                  <span className="font-black">{formatPriceToman(cartTotalPrice)} تومان</span>
                </div>
                {appliedOrderDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>تخفیف کد:</span>
                    <span className="font-black">- {formatPriceToman(appliedOrderDiscount)} تومان</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black border-t-[2px] border-black pt-2 mt-1">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-xl">{formatPriceToman(totalPrice)} تومان</span>
                </div>
              </div>
            </div>

            <div className="bg-[#12e2a3] border-[2.5px] border-black rounded-[16px] p-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-2.5 text-xs font-bold">
              {[
                [ShieldCheck, "ضمانت ۱۰۰٪ بازگشت وجه"],
                [Clock,       "تحویل سریع در ساعات کاری"],
                [Lock,        "پرداخت امن از طریق زیبال"],
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}