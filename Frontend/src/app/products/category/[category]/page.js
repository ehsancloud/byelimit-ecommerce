// src/app/products/category/[category]/page.js
import { notFound } from "next/navigation";
import categoriesData from "../../../../data/categoriesData.json";
import CategoryClientView from "../../../../components/products/CategoryClientView";
import { getProductsByCategory, toProductCardProps } from "../../../../data/products";

export const revalidate = 60;

export async function generateStaticParams() {
  return Object.keys(categoriesData).map((slug) => ({
    category: slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const data = categoriesData[resolvedParams.category];
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: `https://byelimit.ir/products/category/${resolvedParams.category}`,
    },
  };
}

export default async function CategoryProductsPage({ params }) {
  const resolvedParams = await params;
  const categoryInfo = categoriesData[resolvedParams.category];

  if (!categoryInfo) {
    notFound();
  }

  // انتخاب محصولات مرتبط با دسته‌بندی از بک‌اند واقعی
  const products = await getProductsByCategory(categoryInfo.catId);
  const categoryProducts = products.map(toProductCardProps);

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <CategoryClientView
        categoryInfo={categoryInfo}
        products={categoryProducts}
      />
    </main>
  );
}
