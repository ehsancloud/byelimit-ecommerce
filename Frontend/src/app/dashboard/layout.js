"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, User, LogOut, LayoutDashboard, Home } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    apiFetch("/api/auth/me", { silent404: true })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.replace("/auth");
        }
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  // ✅ FIX: تیکت‌های پشتیبانی از منو حذف شد
  const menuItems = [
    { name: "پیشخوان",          href: "/dashboard",         icon: LayoutDashboard },
    { name: "سفارش‌ها و کدها", href: "/dashboard/orders",  icon: ShoppingBag     },
    { name: "پروفایل من",       href: "/dashboard/profile", icon: User            },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-[family-name:var(--font-farsi)] dir-rtl text-black select-none pb-12">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8">

        {/* نوار ناوبری موبایل */}
        <div className="lg:hidden bg-white border-[3px] border-black rounded-2xl p-2 mb-6 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-[2px] font-black text-xs whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-[#12e2a3] border-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]"
                      : "bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {/* دکمه خروج در موبایل */}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-[2px] border-transparent font-black text-xs whitespace-nowrap shrink-0 text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* سایدبار دسکتاپ */}
          <aside className="hidden lg:flex lg:col-span-3 bg-white border-[3.5px] border-black rounded-[24px] p-5 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex-col gap-6 sticky top-20">
            {/* مشخصات کاربر */}
            <div className="flex items-center gap-3 border-b-[2.5px] border-black pb-4">
              <div className="w-12 h-12 bg-[#ccff00] border-[2px] border-black rounded-xl flex items-center justify-center font-black text-base shadow-[-2px_2px_0_0_rgba(0,0,0,1)] shrink-0">
                👤
              </div>
              <div className="overflow-hidden">
                <h3 className="font-black text-sm truncate">
                  {user?.fullName || "کاربر بای لیمیت"}
                </h3>
                <span className="text-xs font-bold text-gray-500 dir-ltr block text-right">
                  {user?.mobile || "---"}
                </span>
              </div>
            </div>

            {/* منوی ناوبری */}
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-[2px] font-black text-sm transition-all ${
                      isActive
                        ? "bg-[#12e2a3] border-black shadow-[-3px_3px_0_0_rgba(0,0,0,1)]"
                        : "bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100 hover:border-black"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* دکمه‌های پایین سایدبار */}
            <div className="flex flex-col gap-2 pt-2 border-t-[2px] border-black">
              <Link href="/"
                className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>بازگشت به سایت</span>
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-right w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>
          </aside>

          {/* محتوای اصلی */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
