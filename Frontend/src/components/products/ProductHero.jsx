// src/components/products/ProductHero.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Headphones,
  AlertTriangle,
  Star,
  Users,
  ShoppingBag,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { validateDiscountCode } from "../../lib/discounts";

export default function ProductHero({
  product,
  selectedVariant,
  onSelectVariant,
  appliedDiscount,
  onApplyDiscount,
  onRemoveDiscount,
  finalUnitPrice,
  onAddToCart,
  isAddingToCart,
  addToCartError,
}) {
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");

  const isPriceTBD = Boolean(selectedVariant.priceTBD) || selectedVariant.price == null;

  const discountPercent =
    !isPriceTBD && selectedVariant.originalPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.originalPrice - selectedVariant.price) /
            selectedVariant.originalPrice) *
            100,
        )
      : 0;

  const hasSalesData = product.totalSalesCount > 0;
  const salesDisplayCount =
    product.monthlySalesCount > 10
      ? product.monthlySalesCount
      : product.totalSalesCount;

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    setDiscountError("");
    const result = validateDiscountCode(discountCode, selectedVariant.price);
    if (!result.valid) {
      setDiscountError(result.message);
      return;
    }
    onApplyDiscount({
      code: discountCode.trim().toUpperCase(),
      amount: result.discountAmount,
    });
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    setDiscountCode("");
    setDiscountError("");
  };

  return (
    <div className="bg-white border-[3.5px] border-black rounded-2xl p-4 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* تصویر محصول و هشدار VPN */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative bg-[#d1c4e9] border-[3px] border-black rounded-xl p-6 flex items-center justify-center overflow-visible">
            {discountPercent > 0 && (
              <div className="absolute top-3 right-3 bg-[#ff4757] text-white border-[2px] border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] z-10">
                {discountPercent}٪ تخفیف
              </div>
            )}
            <Image
              src={product.mainImage}
              alt={product.title}
              width={300}
              height={300}
              priority
              className="w-full h-auto max-h-64 object-contain filter drop-shadow-[-4px_4px_0_rgba(0,0,0,1)]"
            />
          </div>

          {product.requiresVpn && (
            <div className="bg-[#fff9c4] border-[2.5px] border-black p-3.5 rounded-xl flex items-start gap-3 shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs font-bold leading-relaxed">
                <span className="font-black text-black block mb-0.5">
                  پیش‌نیاز استفاده از این ابزار:
                </span>
                {product.vpnNote ||
                  "برای استفاده از این سرویس نیازمند تحریم‌شکن با IP ثابت و معتبر هستید."}
              </div>
            </div>
          )}
        </div>

        {/* اطلاعات، قیمت و پلن‌ها */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#ccff00] border-[1.5px] border-black px-2.5 py-0.5 rounded-md text-xs font-black">
                تحویل{" "}
                {selectedVariant.deliveryTimeMinutes === 0
                  ? "سریع"
                  : `طی ${selectedVariant.deliveryTimeMinutes} دقیقه`}
              </span>
              {product.ratingCount > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 border-[1.5px] border-black px-2 py-0.5 rounded-md text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-black stroke-[1.5]" />
                  <span>{product.ratingAverage}</span>
                  <span className="text-gray-500">
                    ({product.ratingCount} نظر)
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-1">
              {product.title}
            </h1>
            <p className="text-xs md:text-sm font-bold text-gray-600">
              {product.subtitle}
            </p>
          </div>

          {/* انتخاب پلن‌ها */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-black flex items-center justify-between">
              <span>نوع پلن و مدت زمان اشتراک را انتخاب کنید:</span>
              <span className="text-gray-500 font-bold">
                کد محصول: {product.sku}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variants.map((variant) => {
                const isSelected = selectedVariant.id === variant.id;
                const variantTBD = Boolean(variant.priceTBD) || variant.price == null;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => onSelectVariant(variant)}
                    className={`relative text-right p-3.5 rounded-xl border-[2.5px] border-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#12e2a3] shadow-[-4px_4px_0_0_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                        : "bg-white hover:bg-gray-50 shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
                    }`}
                  >
                    {variant.isPopular && (
                      <span className="absolute -top-2.5 left-3 bg-[#ff8f1f] text-black border-[1.5px] border-black px-2 py-0.5 rounded text-[10px] font-black">
                        محبوب‌ترین
                      </span>
                    )}
                    <div className="font-black text-xs md:text-sm mb-1">
                      {variant.name}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-700">
                        {variant.type === "exclusive"
                          ? "اختصاصی ۱۰۰٪"
                          : "اشتراکی قانونی"}
                      </span>
                      <span className="font-black text-black">
                        {variantTBD
                          ? "به‌زودی"
                          : `${variant.price.toLocaleString("fa-IR")} تومان`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Proof - فقط وقتی داده واقعی فروش وجود دارد نمایش داده می‌شود */}
          {hasSalesData && (
            <div className="bg-[#e0f2fe] border-[2px] border-black p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              <Users className="w-5 h-5 text-blue-600 shrink-0 stroke-[2.5]" />
              <div>
                نفر{" "}
                <span className="font-black text-black text-sm">
                  {salesDisplayCount + 1}ام
                </span>{" "}
                این ماه باشید! تا کنون{" "}
                <span className="font-black text-black">
                  {salesDisplayCount} کاربر
                </span>{" "}
                این محصول را خریده‌اند.
              </div>
            </div>
          )}

          {/* کد تخفیف در همین صفحه محصول - فقط برای محصولات با قیمت نهایی‌شده */}
          {!isPriceTBD && (
            <div className="bg-gray-50 border-[2px] border-black p-3.5 rounded-xl flex flex-col gap-2">
              {appliedDiscount ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      کد «{appliedDiscount.code}» اعمال شد (
                      {appliedDiscount.amount.toLocaleString("fa-IR")} تومان تخفیف)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="p-1.5 bg-white border-[1.5px] border-black rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                    aria-label="حذف کد تخفیف"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyDiscount} className="flex flex-col gap-2">
                  <label className="text-xs font-black text-black flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                    <span>کد تخفیف دارید؟ (اختیاری)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="مثال: SAVE50"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 bg-white border-[2px] border-black rounded-xl p-2.5 text-xs font-black outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-[#12e2a3] border-[2px] border-black px-4 py-2.5 rounded-xl font-black text-xs shadow-[-2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      اعمال
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {discountError}
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-gray-500">
                    توجه: در صورت اعمال کد تخفیف در همین مرحله، امکان استفاده از کد دیگر در مرحله پیش‌فاکتور وجود نخواهد داشت.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* قیمت و دکمه ثبت سفارش */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t-[2px] border-black">
            <div>
              <span className="text-[11px] font-bold text-gray-500 block">
                مبلغ قابل پرداخت:
              </span>
              {isPriceTBD ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-black text-black">
                    قیمت این پلن به‌زودی اعلام می‌شود
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {(selectedVariant.originalPrice > selectedVariant.price ||
                    appliedDiscount) && (
                    <span className="line-through text-xs text-gray-400 font-bold">
                      {Math.max(
                        selectedVariant.originalPrice,
                        selectedVariant.price,
                      ).toLocaleString("fa-IR")}
                    </span>
                  )}
                  <span className="text-2xl font-black text-black">
                    {finalUnitPrice.toLocaleString("fa-IR")}{" "}
                    <span className="text-xs font-bold">تومان</span>
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={isPriceTBD || isAddingToCart}
              className={`flex-1 sm:flex-none px-8 py-3.5 rounded-xl border-[3px] border-black font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] transition-all text-black ${
                isPriceTBD || isAddingToCart
                  ? "bg-gray-200 cursor-not-allowed opacity-70"
                  : "bg-[#ccff00] hover:bg-[#b8e600] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              }`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span>
                {isPriceTBD ? "به‌زودی قابل خرید" : isAddingToCart ? "در حال افزودن..." : "ثبت سفارش"}
              </span>
            </button>
          </div>

          {addToCartError && (
            <p className="text-[11px] font-bold text-rose-600 -mt-3">{addToCartError}</p>
          )}

          {isPriceTBD && (
            <p className="text-[11px] font-bold text-gray-500 -mt-3">
              برای اطلاع از قیمت نهایی و زمان فعال‌سازی خرید این پلن، از طریق دکمه‌ی پشتیبانی گوشه صفحه با ما در تماس باشید.
            </p>
          )}

          {/* نمادها */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex items-center gap-1.5 justify-center text-[11px] font-black bg-white border-[1.5px] border-black p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>ضمانت بازگشت</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center text-[11px] font-black bg-white border-[1.5px] border-black p-2 rounded-lg">
              <Zap className="w-4 h-4 text-amber-500 stroke-[2.5]" />
              <span>تحویل سریع</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center text-[11px] font-black bg-white border-[1.5px] border-black p-2 rounded-lg">
              <Headphones className="w-4 h-4 text-purple-600 stroke-[2.5]" />
              <span>پشتیبانی ۱۰ تا ۲۲</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
