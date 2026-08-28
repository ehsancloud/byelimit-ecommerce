// src/app/page.js
import HeroBento from "../components/home/HeroBento";
import TrustTicker from "../components/home/TrustTicker";
import VisualCategories from "../components/home/VisualCategories";
import FlashDeals from "../components/home/FlashDeals";
import Bestsellers from "../components/home/Bestsellers";
import AIComparison from "../components/home/AIComparison";
import WhyUs from "../components/home/WhyUs";
import Testimonials from "../components/home/Testimonials";
import LatestArticles from "../components/home/LatestArticles";
import HomeFaq from "../components/home/HomeFaq";

export const metadata = {
  title: " 8640838 ",
  description:
    "خرید اکانت اختصاصی و قانونی ChatGPT Plus، Midjourney، Claude Pro و سرور مجازی. تحویل سریع با ضمانت ۱۰۰٪ و پشتیبانی هرروز ۱۰ تا ۲۲.",
  alternates: {
    canonical: "https://byelimit.ir",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] font-[family-name:var(--font-farsi)] dir-rtl text-black pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-12 md:gap-20 pt-6">
        {/* ۱. هیرو سکشن Bento Grid + سرچ بار زنده */}
        <HeroBento />

        {/* ۳. نوار متحرک اعتمادسازی و آمار کلیدی */}
        <TrustTicker />

        {/* ۴. دسته‌بندی تصویری و موضوعی */}
        <VisualCategories />

        {/* ۶. پیشنهادات شگفت‌انگیز (FOMO) */}
        <FlashDeals />

        {/* ۵. پرفروش‌ترین اکانت‌ها */}
        <Bestsellers />

        {/* ۷. سیستم مقایسه ابزارها */}
        <AIComparison />

        {/* ۱۰. چرا بای لیمیت؟ */}
        <WhyUs />

        {/* ۸. نظرات و رضایت خریداران */}
        <Testimonials />

        {/* ۱۱. مقالات آموزشی (بلاگ) */}
        <LatestArticles />

        {/* ۱۲. سوالات متداول با اسکیما */}
        <HomeFaq />
      </div>

      {/* ۱۵. دکمه شناور پشتیبانی */}
    </main>
  );
}