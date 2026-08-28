export const API_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL || "http://127.0.0.1:4000")
    : (process.env.NEXT_PUBLIC_API_URL || "");

export async function apiFetch(path, options = {}) {
  const { silent404, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const isServer = typeof window === "undefined";

  // Optional Authorization header from localStorage (kept for backward compatibility).
  const clientHeaders = {};
  if (!isServer) {
    try {
      const token = localStorage.getItem("byelimit_token");
      if (token) {
        clientHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage access errors in some embedded environments
    }
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...clientHeaders,
        ...(fetchOptions.headers || {}),
      },
      // When running in the browser, include credentials so httpOnly cookies (auth_token) are sent
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
  typeof window === "undefined"
    ? (process.env.BACKEND_URL || "http://127.0.0.1:4000")
    : (process.env.NEXT_PUBLIC_API_URL || "");

export async function apiFetch(path, options = {}) {
  const { silent404, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const isServer = typeof window === "undefined";

  const clientHeaders = {};
  if (!isServer) {
    try {
      const token = localStorage.getItem("byelimit_token");
      if (token) {
        clientHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage access errors in some embeded environments
    }
  }
  if (!isServer) {
    const token = localStorage.getItem("byelimit_token");
    if (token) {
      clientHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...clientHeaders,
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
