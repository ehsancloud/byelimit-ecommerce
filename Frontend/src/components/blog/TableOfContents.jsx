// src/components/blog/TableOfContents.jsx
"use client";

import { useState, useEffect } from "react";
import { List } from "lucide-react";

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px" },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <nav className="bg-[#fff9c4] border-[3.5px] border-black rounded-[20px] p-5 mb-8 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      <div className="flex items-center gap-2 font-black text-base mb-3 border-b-[2.5px] border-black pb-2">
        <List className="w-5 h-5 stroke-[2.5]" />
        <span>فهرست عناوین مقاله</span>
      </div>

      <ul className="flex flex-col gap-2 pr-2">
        {headings.map((item) => (
          <li
            key={item.id}
            className={`text-xs md:text-sm font-bold transition-all ${
              item.level === 3 ? "mr-4" : ""
            }`}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 px-2 rounded-lg transition-colors ${
                activeId === item.id
                  ? "bg-[#12e2a3] border-[2px] border-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] font-black"
                  : "hover:bg-black/5"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
