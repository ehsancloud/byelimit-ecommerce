// src/app/rules/page.js
export const metadata = {
  title: "قوانین و مقررات",
  description:
    "قوانین خرید، شرایط ضمانت، سیاست بازگشت وجه و نحوه تحویل سفارش در فروشگاه بای لیمیت.",
  alternates: {
    canonical: "https://byelimit.ir/rules",
  },
  openGraph: {
    title: "قوانین و مقررات بای لیمیت",
    description: "قوانین خرید، ضمانت، بازگشت وجه و تحویل سفارش در بای لیمیت.",
    url: "https://byelimit.ir/rules",
    type: "website",
  },
};

const SECTIONS = [
  {
    title: "۱. نحوه ثبت و تحویل سفارش",
    body: "پس از انتخاب پلن و پرداخت موفق از طریق درگاه بانکی، سفارش شما در پنل کاربری ثبت و وارد صف تحویل می‌شود. اطلاعات اکانت یا لینک فعال‌سازی در ساعات پشتیبانی (۱۰ تا ۲۲) از طریق پنل کاربری و پیام تلگرام برای شما ارسال می‌شود. زمان دقیق تحویل بسته به نوع محصول متفاوت است و در صفحه هر محصول قید شده است.",
  },
  {
    title: "۲. شرایط ضمانت",
    body: "ضمانت بای لیمیت پوشش‌دهنده مشکلاتی است که از سمت سرویس‌دهنده اصلی یا در فرآیند تحویل رخ دهد؛ از جمله عدم دسترسی به اکانت، تغییر رمز عبور بدون اطلاع کاربر یا غیرفعال شدن اشتراک پیش از پایان مدت اعتبار. مدت زمان ضمانت هر پلن (تا آخرین روز اشتراک یا بازه محدودتر) روی صفحه همان محصول مشخص شده است. ضمانت شامل مواردی که ناشی از تغییر رمز عبور توسط خود کاربر، اشتراک‌گذاری غیرمجاز اکانت با افراد دیگر، یا نقض قوانین استفاده سرویس‌دهنده اصلی باشد، نمی‌شود.",
  },
  {
    title: "۳. سیاست بازگشت وجه",
    body: "در صورتی که پیش از تحویل اطلاعات اکانت انصراف خود را از طریق تیکت یا تلگرام اعلام کنید، مبلغ پرداختی به‌طور کامل بازگردانده می‌شود. پس از تحویل اطلاعات اکانت، با توجه به ماهیت دیجیتال و غیرقابل بازگشت بودن این محصولات، امکان انصراف و بازگشت وجه وجود ندارد؛ مگر در مواردی که مشکل از سمت بای لیمیت یا سرویس‌دهنده اصلی باشد و از طریق فرآیند ضمانت قابل جبران نباشد.",
  },
  {
    title: "۴. مسئولیت کاربر در استفاده از اکانت",
    body: "کاربر متعهد است اطلاعات اکانت دریافتی را با افراد دیگر به اشتراک نگذارد، رمز عبور را بدون هماهنگی با پشتیبانی تغییر ندهد و از سرویس مطابق قوانین استفاده شرکت سازنده (مثل OpenAI، Google یا Anthropic) بهره ببرد. هرگونه استفاده خارج از این چارچوب می‌تواند ضمانت را باطل کند.",
  },
  {
    title: "۵. نوسان قیمت",
    body: "قیمت محصولات بر اساس نرخ لحظه‌ای دلار محاسبه می‌شود و ممکن است در بازه‌های زمانی مختلف تغییر کند. قیمت نهایی همان مبلغی است که در لحظه ثبت سفارش روی صفحه محصول و در فاکتور نهایی مشاهده می‌کنید و پس از پرداخت تغییر نمی‌کند.",
  },
  {
    title: "۶. نیاز به فیلترشکن (VPN)",
    body: "برخی سرویس‌ها برای دسترسی پایدار از ایران نیاز به اتصال فیلترشکن دارند. این موضوع به‌طور شفاف روی صفحه هر محصول ذکر شده است. قطعی یا کندی ناشی از کیفیت اتصال اینترنت یا فیلترشکن کاربر، خارج از مسئولیت بای لیمیت است.",
  },
  {
    title: "۷. حریم خصوصی",
    body: "اطلاعات هویتی و شماره تماس کاربران صرفاً برای پردازش سفارش، ارتباط پشتیبانی و اطلاع‌رسانی وضعیت سفارش استفاده می‌شود و در اختیار اشخاص ثالث قرار نمی‌گیرد. اطلاعات پرداخت مستقیماً توسط درگاه بانکی زیبال پردازش می‌شود.",
  },
];

export default function RulesPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://byelimit.ir" },
      { "@type": "ListItem", position: 2, name: "قوانین و مقررات", item: "https://byelimit.ir/rules" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center md:text-right border-b-[3.5px] border-black pb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-3">قوانین و مقررات</h1>
          <p className="text-gray-700 font-bold text-sm md:text-base">
            پیش از خرید، مطالعه این صفحه توصیه می‌شود. با ثبت سفارش در بای
            لیمیت، شما این قوانین را پذیرفته‌اید.
          </p>
        </header>

        <article className="bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg md:text-xl font-black mb-2 border-b-[2.5px] border-black pb-2 inline-block">
                {section.title}
              </h2>
              <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800 mt-3">
                {section.body}
              </p>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
