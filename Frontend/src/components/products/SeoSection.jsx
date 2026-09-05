export default function SeoSection() {
  return (
    <section className="mt-20 border-[3px] border-black bg-white rounded-[20px] p-6 md:p-10 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      {/* متن‌های توضیحی محتوایی سئو */}
      <article className="prose max-w-none text-black">
        <h2 className="text-2xl md:text-3xl font-black mb-4 border-b-[3px] border-black pb-2 inline-block">
          راهنمای خرید اکانت هوش مصنوعی و اشتراک پرمیوم از بای لیمیت
        </h2>
        <p className="text-base font-semibold leading-relaxed text-gray-800 mb-6">
          فروشگاه بای لیمیت سه دسته محصول را در یک‌جا جمع کرده است: ابزارهای
          هوش مصنوعی برای نوشتن، کدنویسی، تولید تصویر و ویدیو؛ اشتراک‌های
          پرمیوم بین‌المللی مثل فیلم، موسیقی و گیمینگ؛ و سرور مجازی با آی‌پی
          ثابت. همه این‌ها با پرداخت ریالی از طریق درگاه بانکی داخلی و بدون
          نیاز به کارت بانکی بین‌المللی قابل خرید هستند.
        </p>

        <h3 className="text-xl font-extrabold mb-3">
          فرق اکانت اختصاصی با اکانت اشتراکی چیست؟
        </h3>
        <p className="text-sm font-semibold leading-loose text-gray-700 mb-6">
          در اکانت اختصاصی، فقط شما به آن دسترسی دارید؛ یعنی سابقه گفت‌وگو،
          پیشنهادهای شخصی‌سازی‌شده و سقف مصرف ماهانه بین چند نفر تقسیم
          نمی‌شود. در نوع اشتراکی، هزینه پایین‌تر است اما دسترسی بین چند
          کاربر مشترک است. نوع دقیق هر پلن پیش از خرید روی صفحه همان محصول
          مشخص شده تا انتخابی آگاهانه داشته باشید.
        </p>
      </article>

      {/* راهنمای دسته‌بندی محصولات */}
      <div className="mt-8 overflow-x-auto">
        <h3 className="text-xl font-black mb-4">
          دسته‌بندی محصولات بای لیمیت
        </h3>
        <table className="w-full text-right border-collapse border-[2.5px] border-black min-w-[600px]">
          <thead>
            <tr className="bg-[#ccff00] border-b-[2.5px] border-black">
              <th className="p-3 border-l-[2.5px] border-black font-black text-sm">
                دسته
              </th>
              <th className="p-3 border-l-[2.5px] border-black font-black text-sm">
                نمونه محصولات
              </th>
              <th className="p-3 font-black text-sm">مناسب برای</th>
            </tr>
          </thead>
          <tbody className="font-bold text-sm">
            <tr className="border-b-[2px] border-black hover:bg-gray-50">
              <td className="p-3 border-l-[2.5px] border-black">
                چت‌بات و تولید متن
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                ChatGPT، Claude، Gemini، Grok
              </td>
              <td className="p-3">نگارش، تحلیل و پاسخ‌گویی هوشمند</td>
            </tr>
            <tr className="border-b-[2px] border-black hover:bg-gray-50 bg-[#12e2a3]/10">
              <td className="p-3 border-l-[2.5px] border-black">
                تصویر و ویدیو
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                Midjourney، Leonardo AI، Runway، Kling
              </td>
              <td className="p-3">طراحی گرافیک و تولید محتوای بصری</td>
            </tr>
            <tr className="border-b-[2px] border-black hover:bg-gray-50">
              <td className="p-3 border-l-[2.5px] border-black">کدنویسی</td>
              <td className="p-3 border-l-[2.5px] border-black">
                GitHub Copilot، Cursor، Replit
              </td>
              <td className="p-3">توسعه‌دهندگان نرم‌افزار و اپ</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-[#12e2a3]/10">
              <td className="p-3 border-l-[2.5px] border-black">
                اشتراک پرمیوم
              </td>
              <td className="p-3 border-l-[2.5px] border-black">
                Netflix، Spotify، Xbox Game Pass
              </td>
              <td className="p-3">سرگرمی و استفاده روزمره</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
