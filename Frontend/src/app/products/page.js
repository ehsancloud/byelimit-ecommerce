// src/app/products/page.js
import ProductsPageClient from "../../components/products/ProductsPageClient";

export const metadata = {
  title: "فروشگاه اکانت‌های هوش مصنوعی | بای لیمیت",
  description:
    "خرید مستقیم و اختصاصی اکانت ChatGPT، Claude، Midjourney، Gemini و ده‌ها ابزار هوش مصنوعی دیگر با تحویل سریع، ضمانت ۱۰۰٪ و پشتیبانی هرروز ۱۰ تا ۲۲.",
  alternates: {
    canonical: "https://byelimit.ir/products",
  },
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialSearch =
    typeof resolvedSearchParams?.search === "string"
      ? resolvedSearchParams.search
      : "";

  return <ProductsPageClient initialSearch={initialSearch} />;
}
