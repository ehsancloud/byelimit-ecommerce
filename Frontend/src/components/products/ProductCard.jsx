import Link from "next/link";
import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";

export default function ProductCard({
  titleFa = "اکانت اختصاصی",
  titleEn,
  guaranteeText = "ضمانت ۱۰۰٪",
  deliveryText = "تحویل سریع",
  rating,
  price,
  oldPrice,
  priceTBD,
  imageSrc,
  href = "#",
}) {
  return (
    // ✅ FIX: کل کارت به Link تبدیل شد - نه فقط دکمه پایین
    // ✅ FIX: سایزها در حالت موبایل کوچک‌تر شدند (p-2.5، فونت کوچک‌تر، ارتفاع کمتر)
    <Link
      href={href}
      className="block w-full bg-[#12e2a3] border-[3px] border-black rounded-[14px] p-2.5 sm:p-4 shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] font-[family-name:var(--font-farsi)] text-black select-none dir-rtl flex flex-col justify-between no-underline hover:shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[-2px] active:translate-y-[2px] transition-all"
    >
      <div>
        {/* بالای کارت: ضمانت و امتیاز */}
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="bg-[#ff8f1f] border-[2px] sm:border-[2.5px] border-black rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]">
            {guaranteeText}
          </div>
          {rating && (
            <div className="bg-white border-[2px] border-black rounded-md px-2 py-0.5 sm:py-1 flex items-center gap-1 shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-0.5 text-[#ffc107]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#ffc107] stroke-[#ffc107]" />
                ))}
              </div>
              <span className="font-extrabold text-[10px] sm:text-xs ml-0.5 dir-ltr">{rating}</span>
            </div>
          )}
        </div>

        {/* کاور محصول */}
        <div className="relative bg-[#f2f4f8] border-[2px] sm:border-[3px] border-black rounded-[10px] aspect-square sm:h-[160px] sm:aspect-auto w-full overflow-hidden">
          {imageSrc ? (
            <Image src={imageSrc} alt={titleEn || titleFa} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
              بدون تصویر
            </div>
          )}
        </div>

        {/* عناوین و قیمت */}
        <div className="text-center mt-2 sm:mt-4">
          <h2 className="text-xs sm:text-[18px] font-black leading-tight line-clamp-2">
            {titleFa}
            {titleEn && (
              <>
                <br />
                <span className="text-sm sm:text-[22px] font-black tracking-normal">
                  {titleEn}
                </span>
              </>
            )}
          </h2>

          <div className="inline-block bg-[#e2e8f0] text-gray-700 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-md mt-1 sm:mt-2 border border-gray-300">
            {deliveryText}
          </div>

          <div className="mt-2 sm:mt-3 flex flex-col items-center justify-center">
            {priceTBD ? (
              <span className="bg-[#fff9c4] border-[1.5px] border-black text-black text-xs sm:text-sm font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                قیمت به‌زودی اعلام می‌شود
              </span>
            ) : (
              <>
                {oldPrice && (
                  <span className="line-through text-gray-500 text-xs sm:text-sm font-bold mb-[-2px]">
                    {oldPrice}
                  </span>
                )}
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-[26px] font-black tracking-tight leading-none">
                    {price}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold">تومان</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* دکمه اکشن - اکنون فقط ظاهری است؛ کل کارت کلیک‌پذیر است */}
      <div className="w-full mt-3 sm:mt-4 bg-[#ccff00] border-[2px] sm:border-[3px] border-black rounded-[10px] py-2 sm:py-2.5 px-3 sm:px-4 flex items-center justify-between font-black text-sm sm:text-base shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-xs sm:text-sm">{priceTBD ? "مشاهده جزئیات" : "مشاهده گزینه‌ها و خرید"}</span>
        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
      </div>
    </Link>
  );
}
