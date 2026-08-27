// src/app/products/[slug]/page.jsx
import { notFound } from "next/navigation";
import ProductPageClient from "../../../components/products/ProductPageClient";
import { getProductBySlug, getAllProducts } from "../../../data/products";

// این صفحات از قبل در زمان build ساخته می‌شوند، ولی هر ۶۰ ثانیه دوباره‌ اعتبارسنجی
// می‌شوند (ISR) - چون قیمت/موجودی محصولات ممکن است در دیتابیس تغییر کند و نباید
// منتظر یک دیپلوی کامل جدید بمانیم تا آن تغییر روی سایت دیده شود.
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch (err) {
    // اگر در زمان build بک‌اند در دسترس نبود (مثلاً هنوز دیپلوی نشده)، build را
    // fail نکن - صفحات به‌صورت on-demand در اولین بازدید ساخته می‌شوند.
    console.error("generateStaticParams: عدم دسترسی به بک‌اند در زمان build:", err.message);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  // اسلاگ نامعتبر -> متادیتای پیش‌فرض (خود صفحه هم ۴۰۴ واقعی برمی‌گرداند)
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

  // اسلاگ نامعتبر -> ۴۰۲/۴۰۴ واقعی (نه اینکه محصول اشتباهی نمایش داده شود)
  if (!product) {
    notFound();
  }

  // فقط پلن‌هایی که قیمت نهایی واقعی دارند وارد Schema قیمت می‌شوند
  // (وگرنه به گوگل قیمت ۰/رایگان اشتباه اعلام می‌شود)
  const pricedVariants = product.variants.filter(
    (v) => typeof v.price === "number" && !v.priceTBD,
  );

  // Schema Markup هوشمند
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

  const faqSchema = product.faqs.length
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
