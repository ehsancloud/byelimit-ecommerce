// src/app/about/page.js
import { ShieldCheck, Zap, Headphones, MessageCircle } from "lucide-react";

export const metadata = {
  title: "درباره ما",
  description:
    "بای لیمیت مرجع خرید اکانت اختصاصی هوش مصنوعی، اشتراک‌های پرمیوم بین‌المللی و سرور مجازی در ایران؛ با پرداخت ریالی، ضمانت ۱۰۰٪ و پشتیبانی روزانه.",
  alternates: {
    canonical: "https://byelimit.ir/about",
  },
  openGraph: {
    title: "درباره بای لیمیت",
    description:
      "بای لیمیت مرجع خرید اکانت اختصاصی هوش مصنوعی و اشتراک‌های پرمیوم در ایران.",
    url: "https://byelimit.ir/about",
    type: "website",
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "درباره بای لیمیت",
    url: "https://byelimit.ir/about",
    mainEntity: {
      "@type": "Organization",
      name: "بای لیمیت",
      url: "https://byelimit.ir",
      logo: "https://byelimit.ir/images/logo.png",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://byelimit.ir" },
      { "@type": "ListItem", position: 2, name: "درباره ما", item: "https://byelimit.ir/about" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center md:text-right border-b-[3.5px] border-black pb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-3">درباره بای لیمیت</h1>
          <p className="text-gray-700 font-bold text-sm md:text-base">
            یک فروشگاه تخصصی برای دسترسی ساده و قانونی به ابزارهای هوش مصنوعی
            و اشتراک‌های بین‌المللی، بدون دردسر پرداخت ارزی.
          </p>
        </header>

        <article className="bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] space-y-6">
          <section>
            <h2 className="text-xl font-black mb-3 border-b-[2.5px] border-black pb-2 inline-block">
              چه کاری انجام می‌دهیم؟
            </h2>
            <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800">
              دسترسی به سرویس‌هایی مثل ChatGPT، Claude، Midjourney یا Netflix
              معمولاً به کارت بانکی بین‌المللی نیاز دارد که تهیه آن برای
              بسیاری از کاربران ایرانی ساده نیست. بای لیمیت این فاصله را پر
              می‌کند: اشتراک این سرویس‌ها را با پرداخت ریالی از طریق درگاه
              بانکی داخلی، روی حساب اختصاصی یا خانوادگی شما فعال می‌کنیم.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-3 border-b-[2.5px] border-black pb-2 inline-block">
              چرا از بای لیمیت بخرید؟
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { Icon: Zap, title: "تحویل سریع", desc: "فعال‌سازی سفارش در ساعات پشتیبانی، بدون معطلی طولانی." },
                { Icon: ShieldCheck, title: "ضمانت ۱۰۰٪", desc: "در صورت بروز مشکل در مدت اعتبار، اکانت جایگزین یا وجه بازگردانده می‌شود." },
                { Icon: Headphones, title: "پشتیبانی هرروز", desc: "پاسخگویی تیکت و تلگرام هرروز از ساعت ۱۰ تا ۲۲." },
                { Icon: MessageCircle, title: "قیمت شفاف", desc: "قیمت‌گذاری بر اساس نرخ لحظه‌ای دلار، بدون هزینه پنهان." },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 bg-[#f8f9fa] border-[2px] border-black p-3.5 rounded-xl"
                >
                  <div className="p-2 border-[2px] border-black rounded-lg shrink-0 bg-[#ccff00]">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">{title}</h3>
                    <p className="text-xs font-bold text-gray-700">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black mb-3 border-b-[2.5px] border-black pb-2 inline-block">
              چه چیزی می‌فروشیم؟
            </h2>
            <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800">
              سه دسته اصلی محصول در بای لیمیت موجود است: ابزارهای هوش مصنوعی
              (مانند ChatGPT، Claude، Gemini، Midjourney، Runway و ابزارهای
              کدنویسی هوشمند)، اشتراک‌های پرمیوم بین‌المللی (فیلم، موسیقی،
              گیمینگ، طراحی، سئو و آموزش) و سرور مجازی (VPS) با آی‌پی ثابت
              اختصاصی. جزئیات دقیق هر پلن، امکانات و محدودیت‌ها پیش از خرید
              در صفحه همان محصول به‌طور شفاف ذکر شده است.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-3 border-b-[2.5px] border-black pb-2 inline-block">
              اعتماد و امنیت پرداخت
            </h2>
            <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800">
              بای لیمیت دارای نماد اعتماد الکترونیکی (اینماد) و نشان اعتماد
              درگاه پرداخت زیبال است. پرداخت‌ها مستقیماً از طریق درگاه بانکی
              پردازش می‌شود و اطلاعات کارت شما در هیچ مرحله‌ای در اختیار
              بای لیمیت قرار نمی‌گیرد.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
