// src/data/blogData.js

export const AUTHORS = {
  "ehsan-kazemi": {
    id: "u1",
    name: "احسان کاظمی",
    slug: "ehsan-kazemi",
    email: "ehsan@example.com",
    avatarUrl: "/images/authors/ehsan.jpg",
    jobTitle: "برنامه‌نویس ارشد فرانت‌اند و متخصص سئو",
    bio: "توسعه‌دهنده اکوسیستم‌های مدرن وب با Next.js و متخصص بهینه‌سازی موتورهای جستجو برای وب‌اپلیکیشن‌های مقیاس‌پذیر.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/ehsan-kazemi",
      github: "https://github.com/ehsan-kazemi",
      twitter: "https://x.com/ehsan_kazemi",
    },
  },
  "m-hesam": {
    id: "u2",
    name: "محمد حسام",
    slug: "m-hesam",
    email: "hesam@example.com",
    avatarUrl: "/images/authors/hesam.jpg",
    jobTitle: "کارشناس هوش مصنوعی و تولید محتوا",
    bio: "پژوهشگر ابزارهای مولد متنی و تصویری هوش مصنوعی با سابقه بررسی تحلیلی مدل‌های بزرگ زبانی (LLM).",
    socialLinks: {
      linkedin: "https://linkedin.com/in/m-hesam",
      twitter: "https://x.com/m_hesam",
    },
  },
};

export const BLOG_POSTS = [
  {
    id: "p1",
    title: "راهنمای جامع خرید و استفاده از ChatGPT Plus در سال ۲۰۲۶",
    slug: "chatgpt-plus-guide-2026",
    summary: "بررسی کامل قابلیت‌های GPT-4o، تحلیل فایل‌های سنگین، تولید تصویر DALL-E 3 و ترفندهای کاربردی جهت افزایش سرعت کار.",
    content: `
      <h2 id="section-1">مقدمه و بررسی اهمیت ChatGPT Plus</h2>
      <p>هوش مصنوعی مولد متن در سال‌های اخیر مرزهای بهره‌وری را جابه‌جا کرده است. نسخه پرمیوم چت جی‌پی‌تی با دسترسی به مدل GPT-4o امکان پردازش همزمان متن، تصویر و کد را برای کاربران حرفه‌ای مهیا می‌سازد.</p>
      
      <div class="callout-box bg-[#ccff00]/30 border-[2.5px] border-black p-4 rounded-xl my-4">
        <strong>نکته مهم:</strong> سرعت پردازش در اکانت‌های اختصاصی تا ۳ برابر بیشتر از نسخه‌های معمولی است و محدودیت‌های زمانی شلوغی سرور در آن وجود ندارد.
      </div>

      <h2 id="section-2">قابلیت‌های کلیدی مدل GPT-4o</h2>
      <p>این مدل نه تنها متون فارسی را با دقت بسیار بالا نگارش می‌کند، بلکه قابلیت تحلیل جداول اکسل و کدهای برنامه‌نویسی را نیز داراست.</p>

      <h3 id="section-2-1">تحلیل فایل و داده‌های سنگین</h3>
      <p>شما می‌توانید فایل‌های PDF یا گزارش‌های مالی را آپلود کرده و در چند ثانیه خلاصه‌ مدیریتی دریافت کنید.</p>

      <h2 id="section-3">نتیجه‌گیری و جمع‌بندی</h2>
      <p>خرید اکانت اختصاصی و قانونی برای افراد و کسب‌وکارهایی که روزانه با تولید محتوا، تحلیل داده یا کدنویسی سر و کار دارند، سرمایه‌گذاری کاملاً توجیه‌پذیری است.</p>
    `,
    featuredImage: "/images/gpt2.jpeg",
    featuredAlt: "راهنمای جامع خرید اکانت ChatGPT Plus",
    readingTime: 8,
    viewsCount: 1420,
    status: "PUBLISHED",
    publishedAt: "2026-05-10T10:00:00Z",
    updatedAt: "2026-08-11T14:30:00Z",
    metaTitle: "خرید اکانت ChatGPT Plus اختصاصی | راهنمای کامل ۲۰۲۶",
    metaDescription: "بررسی کامل ویژگی‌های GPT-4o، روش‌های خرید اکانت قانونی چت جی پی تی پلاس با تحویل آنی و پشتیبانی کامل.",
    canonicalUrl: "https://yourdomain.com/blog/chatgpt-plus-guide-2026",
    authorSlug: "ehsan-kazemi",
    category: { title: "تولید محتوا", slug: "content-creation" },
    tags: [
      { name: "ChatGPT", slug: "chatgpt" },
      { name: "هوش مصنوعی", slug: "ai" },
      { name: "تولید متن", slug: "text-generation" },
    ],
    faqItems: [
      {
        question: "آیا اکانت ChatGPT Plus روی ایمیل شخصی فعال می‌شود؟",
        answer: "بله، تمام اکانت‌ها به‌صورت ۱۰۰٪ اختصاصی و قانونی روی ایمیل شما یا اکانت تحویلی با ضمانت تا آخرین روز فعال می‌گردند.",
      },
      {
        question: "تفاوت GPT-4o با نسخه رایگان چیست؟",
        answer: "سرعت پردازش بالاتر، قابلیت تحلیل فایل‌های PDF و تصویر، دسترسی به DALL-E 3 و عدم مواجهه با محدودیت شلوغی سرور.",
      },
    ],
  },
  {
    id: "p2",
    title: "مقایسه تخصصی GitHub Copilot و Cursor AI برای برنامه‌نویسان",
    slug: "github-copilot-vs-cursor-ai",
    summary: "کدام دستیار هوشمند کدنویسی عملکرد بهتری در پروژه با Next.js دارد؟ بررسی ویژگی‌ها، سرعت و هزینه.",
    content: `
      <h2 id="sec-1">بررسی دستیارهای هوشمند برنامه‌نویسی</h2>
      <p>برنامه‌نویسی در سال ۲۰۲۶ بدون استفاده از دستیارهای هوش مصنوعی مانند Copilot و Cursor سرعت توسعه را کند می‌کند.</p>
      
      <h2 id="sec-2">جدول مقایسه ویژگی‌ها</h2>
      <p>هر دو ابزار از مدل‌های پیشرفته بهره می‌برند اما Cursor بازسازی کدهای کلاینت و سرور را تمیزتر انجام می‌دهد.</p>
    `,
    featuredImage: "/images/copilot.png",
    featuredAlt: "مقایسه GitHub Copilot و Cursor AI",
    readingTime: 6,
    viewsCount: 980,
    status: "PUBLISHED",
    publishedAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    metaTitle: "مقایسه GitHub Copilot و Cursor AI | بهترین ابزار کدنویسی",
    metaDescription: "بررسی دقیق دو دستیار برتر کدنویسی با هوش مصنوعی برای برنامه‌نویسان فرانت‌اند و بک‌اند.",
    canonicalUrl: "https://yourdomain.com/blog/github-copilot-vs-cursor-ai",
    authorSlug: "m-hesam",
    category: { title: "برنامه‌نویسی", slug: "coding-development" },
    tags: [
      { name: "کدنویسی", slug: "coding" },
      { name: "GitHub Copilot", slug: "copilot" },
      { name: "Cursor AI", slug: "cursor" },
    ],
    faqItems: [
      {
        question: "آیا Cursor جایگزین کامل VS Code است؟",
        answer: "بله، Cursor فورکی از VS Code است و تمام اکستنشن‌های شما بدون تغییر روی آن کار می‌کنند.",
      },
    ],
  },
  {
    id: "p3",
    title: "آموزش پرامپت‌نویسی حرفه‌ای در Midjourney v6 برای گرافیست‌ها",
    slug: "midjourney-v6-prompt-guide",
    summary: "ترفندها و کلمات کلیدی طلایی برای ساخت تصاویر واقع‌گرایانه و طرح‌های UI/UX با هوش مصنوعی.",
    content: `
      <h2 id="part-1">اصول پایه پرامپت نویسی در میدجارنی</h2>
      <p>تولید تصاویر تجاری و باکیفیت نیازمند شناخت پارامترهای فنی نورپردازی، نوع لنز دوربین و سبک‌های هنری است.</p>
    `,
    featuredImage: "/images/midjourney.png",
    featuredAlt: "پرامپت نویسی حرفه ای در میدجارنی v6",
    readingTime: 10,
    viewsCount: 2100,
    status: "PUBLISHED",
    publishedAt: "2026-07-15T11:00:00Z",
    updatedAt: "2026-08-10T16:00:00Z",
    metaTitle: "آموزش پرامپت نویسی Midjourney v6 | راهنمای کامل گرافیست‌ها",
    metaDescription: "کامل‌ترین آموزش پرامپت‌نویسی در میدجارنی v6 برای ساخت تصاویر تبلیغاتی و هنری با کیفیت بالا.",
    canonicalUrl: "https://yourdomain.com/blog/midjourney-v6-prompt-guide",
    authorSlug: "ehsan-kazemi",
    category: { title: "طراحی و عکس", slug: "image-editing" },
    tags: [
      { name: "Midjourney", slug: "midjourney" },
      { name: "طراحی گرافیک", slug: "graphic-design" },
    ],
    faqItems: [],
  },
];