// src/hooks/useAuthStatus.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/apiClient";

/**
 * کوکی auth_token عمداً httpOnly است (محافظت XSS)، پس فرانت‌اند نمی‌تواند مستقیم
 * document.cookie آن را بخواند. این هوک وضعیت لاگین را از بک‌اند استعلام می‌کند.
 */
export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me", { silent404: true });
      const user = data?.user || data || null;
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.fullName || user.mobile || "کاربر بای لیمیت");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserName("");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("خطا در خروج از حساب:", err);
    }
    setIsLoggedIn(false);
    setUserName("");
    window.localStorage.removeItem("byelimit_user_name");
  }, []);

  return { isLoggedIn, userName, isChecking, refresh, logout };
}
