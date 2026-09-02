// src/hooks/useAuthStatus.js
"use client";

import { useAuthSync } from "../context/AuthContext";

/**
 * وضعیت لاگین را از AuthContext (که سراسری است و رویداد login/logout را پخش می‌کند)
 * می‌خواند. به‌محض ورود/خروج، در کل وب‌اپ بدون ریلود به‌روز می‌شود.
 */
export function useAuthStatus() {
  return useAuthSync();
}