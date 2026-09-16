// src/components/home/PromoBanner.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function PromoBanner({
  desktopImage = "/images/promo-desktop.jpeg",
  mobileImage = "/images/promo-mobile.jpeg",
  alt = "بنر تبلیغاتی بای لیمیت",
  href,
}) {
  const content = (
    <div className="w-full relative bg-[#12e2a3] border-[3.5px] border-black rounded-2xl md:rounded-[24px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] transition-transform active:translate-x-[-1px] active:translate-y-[1px]">
      {/* نسخه اولترا واید دسکتاپ */}
      <div className="hidden md:block relative w-full aspect-[32/9] sm:aspect-[24/7] min-h-[140px] max-h-[220px]">
        <Image
          src={desktopImage}
          alt={alt}
          fill
          priority={false}
          className="object-cover w-full h-full"
          onError={(e) => {
            // در صورت نبود فایل، استایل بدون تصویر حفظ می‌شود
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* نسخه واید موبایل */}
      <div className="block md:hidden relative w-full aspect-[16/7] min-h-[110px]">
        <Image
          src={mobileImage}
          alt={alt}
          fill
          priority={false}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline select-none">
        {content}
      </Link>
    );
  }

  return <div className="select-none">{content}</div>;
}
