"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/apiClient";

const AuthContext = createContext(null);

// رویداد سراسری برای همگام‌سازی وضعیت لاگین در کل وب‌اپ (بدون ریلود صفحه)
const AUTH_EVENT = "byelimit-auth-changed";
const USER_NAME_KEY = "byelimit_user_name";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me", { silent404: true });
      const u = data?.user || null;
      setUser(u);
      if (typeof window !== "undefined") {
        if (u) {
          localStorage.setItem("byelimit_user", JSON.stringify(u));
          const name = u.fullName || u.mobile || "کاربر بای لیمیت";
          localStorage.setItem(USER_NAME_KEY, name);
        } else {
          localStorage.removeItem("byelimit_user");
          localStorage.removeItem("byelimit_token");
          localStorage.removeItem(USER_NAME_KEY);
        }
      }
    } catch {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("byelimit_user");
        localStorage.removeItem("byelimit_token");
        localStorage.removeItem(USER_NAME_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // لود اولیه
  useEffect(() => {
    try {
      const cached = localStorage.getItem("byelimit_user");
      if (cached) setUser(JSON.parse(cached));
    } catch {}
    if (typeof window !== "undefined") {
      // 💡 پخش رویداد برای همه‌ی کامپوننت‌های مشترک (بدون ریلود صفحه)
      window.addEventListener(AUTH_EVENT, refresh);

      // نمایش سریع از localStorage
      const cachedName = localStorage.getItem(USER_NAME_KEY);
      if (cachedName) setUser((prev) => prev ?? { fullName: cachedName });
    }
    refresh();
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(AUTH_EVENT, refresh);
      }
    };
  }, [refresh]);

  const login = useCallback((userData, token) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("byelimit_user", JSON.stringify(userData));
      localStorage.setItem(
        USER_NAME_KEY,
        userData.fullName || userData.mobile || "کاربر بای لیمیت",
      );
      if (token) localStorage.setItem("byelimit_token", token);
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("byelimit_user");
      localStorage.removeItem("byelimit_token");
      localStorage.removeItem(USER_NAME_KEY);
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  }, []);

  // isLoggedIn/userName برای سازگاری با هوک‌های قدیمی‌تر
  const isLoggedIn = Boolean(user);
  const userName = user?.fullName || user?.mobile || "کاربر بای لیمیت";

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn, userName, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/** همگام‌ساز وضعیت در همه‌ی کامپوننت‌ها (برای آپدیت فوری بعد از login/logout) */
export function useAuthSync() {
  const { refresh, user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(user));
  const [userName, setUserName] = useState(
    user?.fullName || user?.mobile || "کاربر بای لیمیت",
  );

  useEffect(() => {
    setIsLoggedIn(Boolean(user));
    setUserName(user?.fullName || user?.mobile || "کاربر بای لیمیت");
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsLoggedIn(false);
    setUserName("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("byelimit_user");
      localStorage.removeItem("byelimit_token");
      localStorage.removeItem(USER_NAME_KEY);
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  }, []);

  return { isLoggedIn, userName, isChecking: loading, refresh, logout };
}