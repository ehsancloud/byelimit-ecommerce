// src/app/contact/page.js
import { Send, Clock, Ticket } from "lucide-react";

export const metadata = {
  title: "تماس با ما",
  description:
    "راه‌های ارتباط با پشتیبانی بای لیمیت؛ تیکت آنلاین و پشتیبانی تلگرام، هرروز از ساعت ۱۰ تا ۲۲.",
  alternates: {
    canonical: "https://byelimit.ir/contact",
  },
  openGraph: {
    title: "تماس با بای لیمیت",
    description: "راه‌های ارتباط با پشتیبانی بای لیمیت.",
    url: "https://byelimit.ir/contact",
    type: "website",
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با بای لیمیت",
    url: "https://byelimit.ir/contact",
    mainEntity: {
      "@type": "Organization",
      name: "بای لیمیت",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://t.me/byelimit_support",
        availableLanguage: ["Persian"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          opens: "10:00",
          closes: "22:00",
        },
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://byelimit.ir" },
      { "@type": "ListItem", position: 2, name: "تماس با ما", item: "https://byelimit.ir/contact" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center md:text-right border-b-[3.5px] border-black pb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-3">تماس با بای لیمیت</h1>
          <p className="text-gray-700 font-bold text-sm md:text-base">
            پیش از خرید سوالی دارید یا بعد از خرید به راهنمایی نیاز دارید؟
            از یکی از راه‌های زیر با تیم پشتیبانی در ارتباط باشید.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5">
          <a
            href="https://t.me/byelimit_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border-[3px] border-black p-5 rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors no-underline text-black"
          >
            <div className="p-3 bg-[#e0f2fe] border-[2.5px] border-black rounded-xl shrink-0">
              <Send className="w-6 h-6 stroke-[2.5] text-blue-600" />
            </div>
            <div>
              <h2 className="font-black text-base">پشتیبانی تلگرام</h2>
              <p className="text-sm font-bold text-gray-700 dir-ltr text-right">@byelimit_support</p>
              <p className="text-xs font-bold text-gray-500 mt-1">
                سریع‌ترین راه برای دریافت پاسخ و پیگیری سفارش
              </p>
            </div>
          </a>

          <div className="flex items-center gap-4 bg-white border-[3px] border-black p-5 rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
            <div className="p-3 bg-[#e9d5ff] border-[2.5px] border-black rounded-xl shrink-0">
              <Ticket className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-base">تیکت پشتیبانی</h2>
              <p className="text-sm font-bold text-gray-700">
                از طریق «پنل کاربری» بخش تیکت‌ها می‌توانید سوالات مربوط به
                سفارش‌های خود را ثبت کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white border-[3px] border-black p-5 rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
            <div className="p-3 bg-[#a5f3fc] border-[2.5px] border-black rounded-xl shrink-0">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-base">ساعات پاسخگویی</h2>
              <p className="text-sm font-bold text-gray-700">هرروز هفته، از ساعت ۱۰ تا ۲۲</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
