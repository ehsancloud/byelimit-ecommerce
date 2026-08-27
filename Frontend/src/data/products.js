// src/data/products.js

/**
 * *** لایه‌ی داده‌ی محصولات ***
 *
 * GROUPS و CATEGORIES تاکسونومی/ساختار ناوبری سایت هستند (ایستا، سمت فرانت‌اند).
 * PRODUCTS دیگر اینجا هاردکد نیست - از بک‌اند واقعی (Node.js + PostgreSQL) خوانده
 * می‌شود؛ توابع زیر Async هستند و به API بک‌اند وصل می‌شوند.
 */

import { apiFetch } from "../lib/apiClient";

export const GROUPS = [
  { id: "ai-tools", label: "ابزارهای هوش مصنوعی" },
  { id: "premium-subscriptions", label: "اشتراک‌ها و اکانت‌های پرمیوم" },
  { id: "vps", label: "سرور مجازی (VPS)" },
];

export const CATEGORIES = [
  { id: "all", name: "همه محصولات" },
  // ابزارهای هوش مصنوعی
  { id: "text", name: "تولید متن و چت‌بات", group: "ai-tools" },
  { id: "code", name: "کدنویسی و برنامه‌نویسی", group: "ai-tools" },
  { id: "image", name: "تولید تصویر و طراحی", group: "ai-tools" },
  { id: "video", name: "ساخت و ادیت ویدیو", group: "ai-tools" },
  { id: "audio", name: "صدا و تولید موسیقی", group: "ai-tools" },
  { id: "research", name: "تحقیق و مقاله‌نویسی", group: "ai-tools" },
  // اشتراک‌ها و اکانت‌های پرمیوم
  { id: "film-music", name: "فیلم و موسیقی", group: "premium-subscriptions" },
  { id: "gaming", name: "گیمینگ و بازی", group: "premium-subscriptions" },
  { id: "design-graphics", name: "طراحی و گرافیک", group: "premium-subscriptions" },
  { id: "seo-marketing", name: "سئو و مارکتینگ", group: "premium-subscriptions" },
  { id: "education-utility", name: "آموزش و کاربردی", group: "premium-subscriptions" },
  { id: "telegram", name: "تلگرام", group: "premium-subscriptions" },
  // سرور مجازی
  { id: "vps", name: "سرور مجازی (VPS)", group: "vps" },
];


// ===================== توابع دسترسی به داده (متصل به بک‌اند) =====================

/** لیست همه‌ی محصولات (اختیاری: فیلتر بر اساس دسته و/یا جست‌وجو در سمت سرور) */
export async function getAllProducts({ category, search } = {}) {
  const hasServerApiConfig = Boolean(process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL);
  if (typeof window === "undefined" && !hasServerApiConfig) {
    return [];
  }

  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const qs = params.toString();
  return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function getProductBySlug(slug) {
  const hasServerApiConfig = Boolean(process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL);
  if (typeof window === "undefined" && !hasServerApiConfig) {
    return null;
  }
  return apiFetch(`/api/products/${encodeURIComponent(slug)}`, { silent404: true });
}

export async function getProductsByCategory(categoryId) {
  return getAllProducts({ category: categoryId });
}

export async function searchProducts(query) {
  return getAllProducts({ search: query });
}

/** خلاصه‌ی سبک محصول برای کارت‌های گرید (لیست/دسته‌بندی) - تبدیل خالص، بدون فراخوانی شبکه */
function getCheapestVariant(product) {
  const pricedVariants = product.variants.filter(
    (v) => typeof v.price === "number" && !v.priceTBD,
  );
  if (pricedVariants.length === 0) return product.variants[0];
  return pricedVariants.reduce((min, v) => (v.price < min.price ? v : min));
}

export function toProductCardProps(product) {
  const cheapestVariant = getCheapestVariant(product);
  const hasRealPrice =
    typeof cheapestVariant.price === "number" && !cheapestVariant.priceTBD;

  return {
    id: product.id,
    titleFa: product.title.split(" ").slice(0, 2).join(" "),
    titleEn: product.title,
    guaranteeText: "ضمانت ۱۰۰٪",
    deliveryText: "تحویل سریع",
    rating: product.ratingCount > 0 ? product.ratingAverage.toLocaleString("fa-IR") : null,
    ratingNum: product.ratingCount > 0 ? product.ratingAverage : 0,
    // محصولاتی که هنوز قیمت نهایی ندارند، همیشه انتهای مرتب‌سازی قیمتی قرار می‌گیرند
    priceNum: hasRealPrice ? cheapestVariant.price : Number.MAX_SAFE_INTEGER,
    price: hasRealPrice ? cheapestVariant.price.toLocaleString("fa-IR") : null,
    priceTBD: !hasRealPrice,
    oldPrice:
      hasRealPrice && cheapestVariant.originalPrice > cheapestVariant.price
        ? cheapestVariant.originalPrice.toLocaleString("fa-IR")
        : undefined,
    imageSrc: product.mainImage,
    category: product.category,
    href: `/products/${product.slug}`,
  };
}
