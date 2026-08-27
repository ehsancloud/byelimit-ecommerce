export default function SeoSection() {
  return (
    <section className="mt-20 border-[3px] border-black bg-white rounded-[20px] p-6 md:p-10 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      {/* متن‌های توضیحی محتوایی سئو */}
      <article className="prose max-w-none text-black">
        <h2 className="text-2xl md:text-3xl font-black mb-4 border-b-[3px] border-black pb-2 inline-block">
          راهنمای خرید اکانت‌های هوش مصنوعی اختصاصی
        </h2>
        <p className="text-base font-semibold leading-relaxed text-gray-800 mb-6">
          استفاده از ابزارهای هوش مصنوعی نیازمند دسترسی بدون محدودیت و با سرعت
          بالا به نسخه‌های پرمیوم است. با خرید اکانت‌های اختصاصی مانند ChatGPT
          Plus، Gemini Advanced و Midjourney امکانات ویژه‌ای همچون اولویت در
          پردازش، مدل‌های استدلال منطقی پیشرفته و تولید محتوای هوشمند برای شما
          فعال خواهد شد.
        </p>

        <h3 className="text-xl font-extrabold mb-3">
          چرا خرید اکانت قانونی و اختصاصی؟
        </h3>
        <p className="text-sm font-semibold leading-loose text-gray-700 mb-6">
          در اکانت‌های اختصاصی تمامی اطلاعات و سابقه چت‌های شما محفوظ است و
          خطرات قطعی یا بن شدن اکانت‌های اشتراکی را تجربه نخواهید کرد. کلیه
          سرویس‌ها دارای ضمانت ۱۰۰٪ تا آخرین روز اشتراک می‌باشند.
        </p>
      </article>

      {/* جدول مقایسه‌ای SEO */}
      <div className="mt-8 overflow-x-auto">
        <h3 className="text-xl font-black mb-4">
          جدول مقایسه محبوب‌ترین سرویس‌های هوش مصنوعی
        </h3>
        <table className="w-full text-right border-collapse border-[2.5px] border-black min-w-[600px]">
          <thead>
            <tr className="bg-[#ccff00] border-b-[2.5px] border-black">
              <th className="p-3 border-l-[2.5px] border-black font-black text-sm">
                نام سرویس
              </th>
              <th className="p-3 border-l-[2.5px] border-black font-black text-sm">
                مدل هوش مصنوعی
              </th>
              <th className="p-3 border-l-[2.5px] border-black font-black text-sm">
                مناسب برای
              </th>
              <th className="p-3 font-black text-sm">زمان تحویل</th>
            </tr>
          </thead>
          <tbody className="font-bold text-sm">
            <tr className="border-b-[2px] border-black hover:bg-gray-50">
              <td className="p-3 border-l-[2.5px] border-black">
                ChatGPT Plus
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                GPT-4o & GPT-4
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                برنامه‌نویسی، تحلیل داده و تولید متن
              </td>
              <td className="p-3">تحویل سریع</td>
            </tr>
            <tr className="border-b-[2px] border-black hover:bg-gray-50 bg-[#12e2a3]/10">
              <td className="p-3 border-l-[2.5px] border-black">
                Gemini Advanced
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                Gemini 1.5 Pro
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                یکپارچگی با سرویس‌های گوگل و متون طولانی
              </td>
              <td className="p-3">تحویل سریع</td>
            </tr>
            <tr className="border-b-[2px] border-black hover:bg-gray-50">
              <td className="p-3 border-l-[2.5px] border-black">Claude Pro</td>
              <td className="p-3 border-l-[2.5px] border-black">
                Claude 3.5 Sonnet
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                کدنویسی دقیق و نگارش متون طبیعی
              </td>
              <td className="p-3">تحویل سریع</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-[#12e2a3]/10">
              <td className="p-3 border-l-[2.5px] border-black">Midjourney</td>
              <td className="p-3 border-l-[2.5px] border-black">
                v6 Image Model
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                طراحی گرافیک و ساخت تصاویر هوشمند
              </td>
              <td className="p-3">تحویل سریع</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
