"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../lib/apiClient";

// Default value prevents null-destructure during SSR/prerender
const DEFAULT_CTX = {
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
};

const AuthContext = createContext(DEFAULT_CTX);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // لود سریع از حافظه لوکال - جلوگیری از پرش تصویر هنگام رفرش
  useEffect(() => {
    try {
      const cached = localStorage.getItem("byelimit_user");
      if (cached) setUser(JSON.parse(cached));
    } catch {}

    // همگام‌سازی با سرور
    apiFetch("/api/auth/me", { silent404: true })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("byelimit_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("byelimit_user");
          localStorage.removeItem("byelimit_token");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("byelimit_user", JSON.stringify(userData));
      if (token) localStorage.setItem("byelimit_token", token);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("byelimit_user");
      localStorage.removeItem("byelimit_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// همیشه یک آبجکت معتبر برمی‌گرداند - هیچ‌وقت null نیست
export const useAuth = () => useContext(AuthContext) ?? DEFAULT_CTX;
