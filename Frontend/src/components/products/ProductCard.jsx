import Image from "next/image";
import Link from "next/link";
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
    <div className="w-full bg-[#12e2a3] border-[3px] border-black rounded-[14px] p-4 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)] font-[family-name:var(--font-farsi)] text-black select-none dir-rtl flex flex-col justify-between">
      <div>
        {/* بالای کارت: ضمانت و امتیاز */}
        <div className="flex justify-between items-center mb-3">
          <div className="bg-[#ff8f1f] border-[2.5px] border-black rounded-md px-3 py-1 text-xs font-black shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]">
            {guaranteeText}
          </div>
          {rating && (
            <div className="bg-white border-[2.5px] border-black rounded-md px-2.5 py-1 flex items-center gap-1.5 shadow-[-2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-0.5 text-[#ffc107]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#ffc107] stroke-[#ffc107]"
                  />
                ))}
              </div>
              <span className="font-extrabold text-xs ml-0.5 dir-ltr">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* کاور محصول */}
        <div className="relative bg-[#f2f4f8] border-[3px] border-black rounded-[10px] h-[180px] w-full overflow-hidden">
          <Image src={imageSrc} alt={titleEn} fill className="object-cover" />
        </div>

        {/* عناوین و توضیحات */}
        <div className="text-center mt-4">
          <h2 className="text-[20px] font-black leading-tight">
            {titleFa}
            <br />
            <span className="text-[24px] font-black tracking-normal">
              {titleEn}
            </span>
          </h2>

          <div className="inline-block bg-[#e2e8f0] text-gray-700 text-xs font-bold px-3 py-1 rounded-md mt-2 border border-gray-300">
            {deliveryText}
          </div>

          <div className="mt-3 flex flex-col items-center justify-center">
            {priceTBD ? (
              <span className="bg-[#fff9c4] border-[1.5px] border-black text-black text-sm font-black px-3 py-1.5 rounded-lg">
                قیمت به‌زودی اعلام می‌شود
              </span>
            ) : (
              <>
                {oldPrice && (
                  <span className="line-through text-gray-500 text-sm font-bold mb-[-2px]">
                    {oldPrice}
                  </span>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[30px] font-black tracking-tight leading-none">
                    {price}
                  </span>
                  <span className="text-sm font-extrabold">تومان</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* دکمه اکشن */}
      <Link
        href={href}
        className="w-full mt-4 bg-[#ccff00] hover:bg-[#b5e600] border-[3px] border-black rounded-[10px] py-2.5 px-4 flex items-center justify-between font-black text-base shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all no-underline text-black"
      >
        <span>{priceTBD ? "مشاهده جزئیات" : "مشاهده گزینه‌ها و خرید"}</span>
        <ArrowUpRight className="w-5 h-5 stroke-[3]" />
      </Link>
    </div>
  );
}
