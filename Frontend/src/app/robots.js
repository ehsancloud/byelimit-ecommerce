// src/app/robots.js
const BASE_URL = "https://byelimit.ir";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/checkout/*", "/auth", "/dashboard", "/dashboard/*", "/cart"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
