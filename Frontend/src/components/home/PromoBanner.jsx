// src/components/home/PromoBanner.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function PromoBanner({
  desktopImage = "/images/ban1.jpeg",
  mobileImage = "/images/ban1.jpeg",
  alt = "بنر تبلیغاتی بای لیمیت",
  href,
}) {
  const content = (
    <div className="w-full relative bg-black border-[3px] sm:border-[3.5px] border-black rounded-xl sm:rounded-2xl md:rounded-[22px] overflow-hidden shadow-[-4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[-6px_6px_0_0_rgba(0,0,0,1)] transition-transform active:translate-x-[-1px] active:translate-y-[1px]">
      {/* نسخه اولترا واید دسکتاپ (کشیده با ارتفاع کمتر) */}
      <div className="hidden md:block relative w-full aspect-[5/1] lg:aspect-[6/1] max-h-[140px] min-h-[85px]">
        <Image
          src={desktopImage}
          alt={alt}
          fill
          priority={false}
          className="object-cover object-center w-full h-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* نسخه واید موبایل (کشیده با ارتفاع متناسب) */}
      <div className="block md:hidden relative w-full aspect-[18/7] min-h-[70px] max-h-[100px]">
        <Image
          src={mobileImage}
          alt={alt}
          fill
          priority={false}
          className="object-cover object-center w-full h-full"
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
