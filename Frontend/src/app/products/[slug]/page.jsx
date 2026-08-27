import { notFound } from "next/navigation";
import ProductPageClient from "../../../components/products/ProductPageClient";
import { getProductBySlug } from "../../../data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return { title: "محصول یافت نشد | بای لیمیت" };
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
    name: product.title,
    image: `https://byelimit.ir${product.mainImage}`,
    description: product.metaDescription,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "بای لیمیت",
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

      <ProductPageClient product={product} />
    </>
  );
}
