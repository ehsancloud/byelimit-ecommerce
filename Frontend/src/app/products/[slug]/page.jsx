import { notFound } from "next/navigation";
import ProductPageClient from "../../../components/products/ProductPageClient";
import { getProductBySlug } from "../../../data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return { title: "محصول یافت نشد" };
  }

  return {
    title: product.metaTitle,
    description: product.metaDescription,
    alternates: {
      canonical: `https://byelimit.ir/products/${product.slug}`,
    },
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      images: [product.mainImage],
    },
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const pricedVariants = product.variants.filter(
    (v) => typeof v.price === "number" && !v.priceTBD,
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.titlePrefix || "خرید اشتراک"} ${product.title}`,
    image: `https://byelimit.ir${product.mainImage}`,
    description: product.metaDescription,
    sku: product.sku,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "بای لیمیت",
      logo: "https://byelimit.ir/images/logo.png",
    },
    offers: pricedVariants.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "IRT",
          lowPrice: Math.min(...pricedVariants.map((v) => v.price)),
          highPrice: Math.max(...pricedVariants.map((v) => v.price)),
          offerCount: pricedVariants.length,
          availability: "https://schema.org/InStock",
        }
      : undefined,
    aggregateRating: product.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: product.ratingAverage,
          reviewCount: product.ratingCount,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,
  };

  const faqSchema = product.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://byelimit.ir" },
      { "@type": "ListItem", position: 2, name: "فروشگاه", item: "https://byelimit.ir/products" },
      {
        "@type": "ListItem",
        position: 3,
        name: `${product.titlePrefix || "خرید اشتراک"} ${product.title}`,
        item: `https://byelimit.ir/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProductPageClient product={product} />
    </>
  );
}
