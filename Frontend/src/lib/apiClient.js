export const API_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL || "http://127.0.0.1:4000")
    : (process.env.NEXT_PUBLIC_API_URL || "");

/**
 * @param {string} path مثلاً "/api/products"
 * @param {RequestInit & { silent404?: boolean }} options
 */
export async function apiFetch(path, options = {}) {
  const { silent404, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const isServer = typeof window === "undefined";

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers || {}),
      },
      ...(isServer ? {} : { credentials: "include" }),
      cache: "no-store",
    });

    if (res.status === 404 && silent404) {
      return null;
    }

    if (!res.ok) {
      let body = {};
      try {
        body = await res.json();
      } catch {}
      const err = new Error(body.error || `درخواست ناموفق بود (${res.status})`);
      err.status = res.status;
      err.code = body.code;
      throw err;
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    if (silent404 && err.status === 404) return null;
    throw err;
  }
}
