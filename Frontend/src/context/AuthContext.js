// Frontend/src/context/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/apiClient";

const DEFAULT_CTX = {
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext(DEFAULT_CTX);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearLocalAuth = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("byelimit_user");
        localStorage.removeItem("byelimit_token");
      } catch {}
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me", { silent404: true });
      if (data?.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("byelimit_user", JSON.stringify(data.user));
        }
        return data.user;
      } else {
        clearLocalAuth();
        return null;
      }
    } catch (err) {
      // اگر توکن منقضی شده بود (خطای 401/403)، اطلاعات سشن پاکسازی می‌شود
      if (err.status === 401 || err.status === 403) {
        clearLocalAuth();
      }
      return null;
    }
  }, [clearLocalAuth]);

  useEffect(() => {
    // بارگذاری اولیه از کش برای جلوگیری از پرش تصویر
    try {
      const cached = localStorage.getItem("byelimit_user");
      if (cached) setUser(JSON.parse(cached));
    } catch {}

    // استعلام وضعیت معتبر از سرور
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = (userData, token) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("byelimit_user", JSON.stringify(userData));
        if (token) localStorage.setItem("byelimit_token", token);
      } catch {}
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    clearLocalAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) ?? DEFAULT_CTX;