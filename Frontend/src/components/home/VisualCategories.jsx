// src/components/home/VisualCategories.jsx
"use client";

import Link from "next/link";
import {
  FileText,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";

export default function VisualCategories() {
  const categories = [
    {
      name: "تولید محتوا و متن",
      icon: FileText,
      color: "bg-purple-200",
      href: "/products/category/content-creation",
    },
    {
      name: "برنامه‌نویسی و کُد",
      icon: Code2,
      color: "bg-emerald-200",
      href: "/products/category/coding-development",
    },
    {
      name: "ساخت و ادیت عکس",
      icon: ImageIcon,
      color: "bg-amber-200",
      href: "/products/category/image-editing",
    },
    {
      name: "ساخت و ادیت ویدیو",
      icon: Video,
      color: "bg-rose-200",
      href: "/products/category/video-editing",
    },
    {
      name: "صدا و موسیقی",
      icon: Music,
      color: "bg-cyan-200",
      href: "/products/category/audio-music",
    },
    {
      name: "تحقیق و آموزش",
      icon: GraduationCap,
      color: "bg-indigo-200",
      href: "/products/category/research-education",
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <LayoutGrid className="w-6 h-6 stroke-[2.5]" />
        <h2 className="text-2xl font-black">دسته‌بندی موضوعی ابزارها</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className={`bg-white border-[3px] border-black rounded-[20px] p-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[-6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center text-center gap-3 no-underline text-black group`}
            >
              <div
                className={`p-3.5 ${cat.color} border-[2px] border-black rounded-2xl group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs md:text-sm">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
