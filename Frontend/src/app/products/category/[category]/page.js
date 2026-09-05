import { notFound } from "next/navigation";
import categoriesData from "../../../../data/categoriesData.json";
import CategoryClientView from "../../../../components/products/CategoryClientView";
import { getProductsByCategory, toProductCardProps } from "../../../../data/products";

export const dynamic = "force-dynamic";

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

  const products = await getProductsByCategory(categoryInfo.catId);
  const categoryProducts = products.map(toProductCardProps);

  const BASE_URL = "https://byelimit.ir";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "فروشگاه", item: `${BASE_URL}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryInfo.titleFa,
        item: `${BASE_URL}/products/category/${resolvedParams.category}`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryInfo.metaTitle,
    description: categoryInfo.metaDescription,
    url: `${BASE_URL}/products/category/${resolvedParams.category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryProducts.slice(0, 24).map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${BASE_URL}${p.href}`,
        name: `${p.titlePrefix} ${p.title}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CategoryClientView
        categoryInfo={categoryInfo}
        products={categoryProducts}
      />
    </main>
  );
}
