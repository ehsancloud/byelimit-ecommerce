// src/app/faq/page.js
import Link from "next/link";
import { HelpCircle, MessageCircle } from "lucide-react";
import FaqAccordion from "../../components/products/FaqAccordion";

export const metadata = {
  title: "سوالات متداول",
  description:
    "پاسخ به پرتکرارترین سوالات درباره خرید، تحویل، ضمانت، پرداخت و استفاده از اکانت‌های هوش مصنوعی و اشتراک‌های پرمیوم بای لیمیت.",
  alternates: {
    canonical: "https://byelimit.ir/faq",
  },
  openGraph: {
    title: "سوالات متداول | بای لیمیت",
    description:
      "پاسخ به پرتکرارترین سوالات درباره خرید، تحویل، ضمانت و پرداخت در بای لیمیت.",
    url: "https://byelimit.ir/faq",
    type: "website",
  },
};

const GENERAL_FAQS = [
  {
    question: "خرید از بای لیمیت چقدر زمان می‌برد و اکانت کی تحویل داده می‌شود؟",
    answer:
      "پس از پرداخت موفق، سفارش وارد صف تحویل می‌شود و در ساعات پشتیبانی (هرروز ۱۰ تا ۲۲) معمولاً در کوتاه‌ترین زمان ممکن فعال می‌شود. اطلاعات اکانت یا لینک فعال‌سازی از طریق پنل کاربری و پیام تلگرام برای شما ارسال می‌شود.",
  },
  {
    question: "ضمانت ۱۰۰٪ بای لیمیت دقیقاً یعنی چه؟",
    answer:
      "اگر اکانت یا اشتراک خریداری‌شده در طول مدت اعتبار دچار مشکل شود (قطعی، عدم دسترسی، تغییر رمز از سمت سرویس‌دهنده)، بای لیمیت اکانت را جایگزین یا مابه‌التفاوت را جبران می‌کند. شرایط دقیق ضمانت هر محصول در صفحه همان محصول و در صفحه قوانین و مقررات آمده است.",
  },
  {
    question: "آیا برای استفاده از این اکانت‌ها به فیلترشکن (VPN) نیاز دارم؟",
    answer:
      "بستگی به سرویس دارد. برخی ابزارها از ایران بدون محدودیت در دسترس هستند و برخی دیگر برای اتصال پایدار به فیلترشکن نیاز دارند. این موضوع دقیقاً روی صفحه هر محصول و در بخش سوالات متداول همان محصول مشخص شده است.",
  },
  {
    question: "پرداخت در بای لیمیت چگونه انجام می‌شود و امن است؟",
    answer:
      "پرداخت‌ها از طریق درگاه بانکی زیبال و به‌صورت ریالی انجام می‌شود. سایت دارای نماد اعتماد الکترونیکی (اینماد) و نشان اعتماد زیبال است و اطلاعات کارت بانکی شما مستقیماً توسط درگاه پردازش می‌شود، نه توسط بای لیمیت.",
  },
  {
    question: "قیمت‌ها بر چه اساسی محاسبه می‌شوند و ثابت هستند؟",
    answer:
      "قیمت محصولات بر اساس نرخ لحظه‌ای دلار محاسبه و به‌روزرسانی می‌شود، به همین دلیل ممکن است روزانه تغییر کند. قیمت نهایی همیشه همان مبلغی است که در لحظه ثبت سفارش روی صفحه محصول مشاهده می‌کنید.",
  },
  {
    question: "اکانت‌ها اختصاصی هستند یا اشتراکی بین چند کاربر؟",
    answer:
      "بسته به محصول، هر دو حالت وجود دارد. نوع دسترسی (اختصاصی یا اشتراکی) برای هر پلن به‌طور شفاف در صفحه همان محصول قید شده تا پیش از خرید دقیقاً بدانید چه چیزی دریافت می‌کنید.",
  },
  {
    question: "اگر بعد از خرید سوالی داشته باشم، چطور پشتیبانی بگیرم؟",
    answer:
      "پشتیبانی بای لیمیت از طریق تیکت در پنل کاربری و همچنین تلگرام (@byelimit_support) هرروز از ساعت ۱۰ تا ۲۲ پاسخگوی سوالات و مشکلات احتمالی است.",
  },
  {
    question: "آیا امکان بازگشت وجه وجود دارد؟",
    answer:
      "در صورتی که پیش از تحویل اطلاعات اکانت انصراف دهید یا مشکلی از سمت بای لیمیت در تحویل سفارش پیش بیاید، مبلغ پرداختی طبق قوانین بازگشت وجه سایت عودت داده می‌شود. جزئیات کامل در صفحه قوانین و مقررات موجود است.",
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GENERAL_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://byelimit.ir" },
      { "@type": "ListItem", position: 2, name: "سوالات متداول", item: "https://byelimit.ir/faq" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center md:text-right border-b-[3.5px] border-black pb-6">
          <div className="inline-flex items-center gap-2 bg-[#ccff00] border-[2.5px] border-black px-3 py-1 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] mb-3">
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            <span>سوالات متداول</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            سوالات متداول درباره خرید از بای لیمیت
          </h1>
          <p className="text-gray-700 font-bold text-sm md:text-base">
            پاسخ سوالات عمومی درباره تحویل، ضمانت، پرداخت و پشتیبانی. برای
            سوالات مربوط به یک محصول خاص، بخش سوالات متداول همان صفحه محصول
            را ببینید.
          </p>
        </header>

        <div className="bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)]">
          <FaqAccordion faqs={GENERAL_FAQS} />
        </div>

        <div className="mt-8 bg-[#12e2a3] border-[3.5px] border-black rounded-2xl p-6 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border-[2.5px] border-black rounded-xl shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              <MessageCircle className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">سوال شما پاسخ داده نشد؟</h2>
              <p className="text-xs font-bold text-gray-800">
                پشتیبان‌های بای لیمیت هرروز ساعت ۱۰ تا ۲۲ پاسخگوی شما هستند.
              </p>
            </div>
          </div>
          <a
            href="https://t.me/byelimit_support"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-[2.5px] border-black px-6 py-2.5 rounded-xl font-black text-xs md:text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-yellow-200 transition-all shrink-0 no-underline text-black"
          >
            گفتگو با پشتیبانی
          </a>
        </div>

        <p className="text-center text-xs font-bold text-gray-500 mt-6">
          همچنین می‌توانید{" "}
          <Link href="/rules" className="underline hover:text-black">
            قوانین و مقررات
          </Link>{" "}
          و{" "}
          <Link href="/about" className="underline hover:text-black">
            درباره بای لیمیت
          </Link>{" "}
          را مطالعه کنید.
        </p>
      </div>
    </main>
  );
}
