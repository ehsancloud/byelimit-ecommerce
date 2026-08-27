// src/lib/apiClient.js

// آدرس بک‌اند - در توسعه به‌صورت پیش‌فرض روی localhost، در پروداکشن باید
// در متغیرهای محیطی برابر آدرس واقعی اپ بک‌اند ست شود.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  (typeof window === "undefined"
    ? "https://api.byelimit.ir" // server-side fallback to deployed API
    : "");

/**
 * @param {string} path  مثلاً "/api/products"
 * @param {RequestInit & { silent404?: boolean }} options
 */
export async function apiFetch(path, options = {}) {
  const { silent404, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...fetchOptions,
    // برای ارسال/دریافت کوکی auth_token و cart_token بین دامنه فرانت و بک‌اند
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    cache: fetchOptions.cache || "no-store",
  });

  if (res.status === 404 && silent404) {
    return null;
  }

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {
      // پاسخ JSON نبود - نادیده بگیر
    }
    const err = new Error(body.error || `درخواست به سرور ناموفق بود (${res.status})`);
    err.status = res.status;
    err.code = body.code;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}
