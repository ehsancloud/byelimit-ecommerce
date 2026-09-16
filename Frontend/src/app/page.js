// src/app/page.js
import HeroBento from "../components/home/HeroBento";
import TrustTicker from "../components/home/TrustTicker";
import VisualCategories from "../components/home/VisualCategories";
import FlashDeals from "../components/home/FlashDeals";
import Bestsellers from "../components/home/Bestsellers";
import MostViewed from "../components/home/MostViewed";
import PromoBanner from "../components/home/PromoBanner";
import AnnouncementBanner from "../components/home/AnnouncementBanner";
import AIComparison from "../components/home/AIComparison";
import WhyUs from "../components/home/WhyUs";
import Testimonials from "../components/home/Testimonials";
import LatestArticles from "../components/home/LatestArticles";
import HomeFaq from "../components/home/HomeFaq";

export const metadata = {
  title: "فروشگاهی امن برای خرید اشتراک های اختصاصی",
  description:
    "خرید اکانت اختصاصی و قانونی ChatGPT Plus، Midjourney، Claude Pro و سرور مجازی. تحویل سریع با ضمانت ۱۰۰٪ و پشتیبانی هرروز ۱۰ تا ۲۲.",
  alternates: {
    canonical: "https://byelimit.ir",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] font-[family-name:var(--font-farsi)] dir-rtl text-black pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-8 md:gap-14 pt-4">
        {/* اطلاعیه قرمز رنگ سراسری سایت (تنظیم از پریسما استودیو - در صورت null رندر نمی شود) */}
        <AnnouncementBanner />

        {/* بنر تبلیغاتی ۱ (اولترا واید بالای بنتو گرید) */}
        <PromoBanner
          desktopImage="/images/uban1.jpeg"
          mobileImage="/images/uban1.jpeg"
          alt="بنر ویژه بالای سایت بای لیمیت"
        />

        {/* ۱. هیرو سکشن Bento Grid + سرچ بار زنده */}
        <HeroBento />

        {/* ۳. نوار متحرک اعتمادسازی و آمار کلیدی */}
        <TrustTicker />

        {/* ۴. دسته بندی تصویری و موضوعی */}
        <VisualCategories />

        {/* ۶. پیشنهادات شگفت انگیز (FOMO) */}
        <FlashDeals />

        {/* بنر تبلیغاتی ۲ (افقی وسط صفحه) */}
        <PromoBanner
          desktopImage="/images/promo2-desktop.jpeg"
          mobileImage="/images/promo2-mobile.jpeg"
          alt="بنر تبلیغاتی میانی بای لیمیت"
        />

        {/* ۵. پرفروش ترین اکانت ها */}
        <Bestsellers />

        {/* پربازدیدترین و محبوب ترین اکانت ها */}
        <MostViewed />

        {/* ۷. سیستم مقایسه ابزارها */}
        <AIComparison />

        {/* ۱۰. چرا بای لیمیت؟ */}
        <WhyUs />

        {/* بنر تبلیغاتی ۳ (افقی پایین صفحه) */}
        <PromoBanner
          desktopImage="/images/promo3-desktop.jpeg"
          mobileImage="/images/promo3-mobile.jpeg"
          alt="بنر تخفیف و پیشنهاد ویژه بای لیمیت"
        />

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