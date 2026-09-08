// src/components/home/Testimonials.jsx
"use client";

import { Star, MessageSquareQuote, BadgeCheck } from "lucide-react";

const AVATAR_COLORS = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-emerald-300",
  "bg-sky-300",
  "bg-violet-300",
  "bg-pink-300",
];

function Avatar({ name, colorIdx }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("");
  return (
    <div
      className={`w-11 h-11 ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]} border-[2px] border-black rounded-full flex items-center justify-center font-black text-sm text-black shrink-0`}
    >
      {initials}
    </div>
  );
}

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < count
              ? "fill-amber-400 stroke-amber-500"
              : "fill-gray-200 stroke-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

const reviews = [
  {
    name: "امیرحسین کریمی",
    role: "توسعه‌دهنده فرانت‌اند",
    time: "۲ هفته پیش",
    tool: "Claude Pro",
    comment:
      "من Claude رو برای code review روزانه استفاده می‌کنم. یه بار اکانتم مشکلی پیش اومد، بچه‌های پشتیبانی تو کمتر از نیم ساعت برام جایگزین فرستادن. قیمتشونم نسبت به چند سایت دیگه که تست کردم منطقی‌تر بود.",
    rating: 5,
  },
  {
    name: "نگار رحیمی",
    role: "طراح گرافیک",
    time: "۱ ماه پیش",
    tool: "Midjourney v6",
    comment:
      "با Midjourney پوستر می‌زنم و کارم خیلی سریع‌تر شده. فقط کاش یه راهنمای کوتاه برای پرامپت نویسی هم تو سایت می‌ذاشتین که تازه‌کارا راحت‌تر شروع کنن. در کل از خریدم راضیم.",
    rating: 5,
  },
  {
    name: "پویا صفری",
    role: "تریدر ارز دیجیتال",
    time: "۳ هفته پیش",
    tool: "VPS آلمان",
    comment:
      "سرور آلمان رو برای ترید گرفتم. پینگش خوبه و قطعی نداشتم تا الان. تحویلش یکم طول کشید (حدود ۲۰ دقیقه) ولی در کل اوکیه و قیمتشم مناسب بود.",
    rating: 4,
  },
  {
    name: "مریم خسروی",
    role: "نویسنده محتوا",
    time: "۱ هفته پیش",
    tool: "ChatGPT Plus",
    comment:
      "از GPT-4 برای ایده‌پردازی و بازنویسی متن استفاده می‌کنم. چیزی که برام مهم بود، اصالت اکانت بود که خوشبختانه کاملاً اختصاصی و به نام خودم بود.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <MessageSquareQuote className="w-6 h-6 stroke-[2.5]" />
        <h2 className="text-2xl font-black">تجربه خریداران بای لیمیت</h2>
      </div>

      {/* همه کارت‌ها هم‌اندازه: در دسکتاپ ۴ ستون مساوی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[-5px_5px_0_0_rgba(0,0,0,1)] flex flex-col gap-4 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-300"
          >
            {/* هدر با آواتار و اطلاعات */}
            <div className="flex items-start gap-3">
              <Avatar name={rev.name} colorIdx={idx} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-black text-sm truncate">{rev.name}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 stroke-white shrink-0" />
                </div>
                <div className="text-[11px] font-bold text-gray-500 truncate">
                  {rev.role}
                </div>
              </div>
              <Stars count={rev.rating} />
            </div>

            {/* متن نظر */}
            <p className="font-medium text-xs md:text-sm text-gray-700 leading-relaxed flex-1">
              {rev.comment}
            </p>

            {/* فوتر با ابزار و تاریخ */}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-300">
              <span className="text-[11px] font-black text-gray-500">
                خرید: <span className="text-black">{rev.tool}</span>
              </span>
              <span className="text-[11px] font-bold text-gray-400">
                {rev.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* فوتر دعوت به مشاهده نظرات بیشتر */}
      <div className="mt-6 text-center">
        <a
          href="https://t.me/byelimit_support"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-black text-gray-600 hover:text-black border-b-2 border-dashed border-gray-400 hover:border-black transition-colors"
        >
          برای مطالعه نظرات بیشتر به کانال تلگرام ما سر بزنید
        </a>
      </div>
    </section>
  );
}