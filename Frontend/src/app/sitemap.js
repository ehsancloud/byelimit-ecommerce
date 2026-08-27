// src/app/sitemap.js
import { BLOG_POSTS } from "../data/blogData";
import { getAllProducts } from "../data/products";
import categoriesData from "../data/categoriesData.json";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://byelimit.ir";

export default async function sitemap() {
  // آدرس‌های ثابت سایت (فقط صفحاتی که واقعاً وجود دارند)
  const staticRoutes = ["", "/products", "/blog"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.9,
  }));

  // صفحات محصول - قبلاً اصلاً در sitemap نبودند
  let products = [];
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error("sitemap: عدم دسترسی به بک‌اند:", err.message);
  }
  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // صفحات دسته‌بندی - قبلاً اصلاً در sitemap نبودند
  const categoryRoutes = Object.keys(categoriesData).map((slug) => ({
    url: `${BASE_URL}/products/category/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // آدرس پویای مقالات وبلاگ همراه با lastmod دقیق
  const postRoutes = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...postRoutes];
}
