// src/components/home/AIComparison.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";

export default function AIComparison() {
  const [activeTab, setActiveTab] = useState("text");

  const comparisonData = {
    text: [
      { name: "ChatGPT Plus", col1: "عالی", col2: "مناسب", col3: "بسیار بالا", link: "/products/chatgpt", img: "/images/gpt2.jpeg" },
      { name: "Claude 3.5", col1: "خوب", col2: "بسیار عالی", col3: "بالا", link: "/products/claude", img: "/images/claude.png" },
    ],
    image: [
      { name: "Midjourney", col1: "هنری", col2: "بسیار عالی", col3: "متوسط", link: "/products/midjourney", img: "/images/midjourney.png" },
      { name: "DALL·E 3", col1: "واقع‌گرایانه", col2: "عالی", col3: "بالا", link: "/products/chatgpt", img: "/images/gpt2.jpeg" },
    ]
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-6 border-b-[3.5px] border-black pb-2">
        <GitCompare className="w-6 h-6 stroke-[3]" />
        <h2 className="text-2xl font-black">کدام ابزار برای من مناسب‌تر است؟</h2>
      </div>

      <div className="bg-white border-[3.5px] border-black rounded-[24px] overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center border-b-[3.5px] border-black bg-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-6 py-4 font-black text-sm border-l-[3.5px] border-black transition-colors cursor-pointer ${activeTab === "text" ? "bg-[#12e2a3]" : "hover:bg-gray-200"}`}
          >
            تولید متن و کُد
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`px-6 py-4 font-black text-sm border-l-[3.5px] border-black transition-colors cursor-pointer ${activeTab === "image" ? "bg-[#12e2a3]" : "hover:bg-gray-200"}`}
          >
            تولید تصویر و عکس
          </button>
        </div>

        <div className="p-4 md:p-8 overflow-x-auto relative">
          {/* سایه گرادیانت برای القای اسکرول در موبایل */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-white pointer-events-none z-10 md:hidden" />
          
          <table className="w-full text-right text-xs md:text-sm font-bold min-w-[600px]">
            <thead className="bg-[#ccff00] border-[2.5px] border-black font-black">
              <tr>
                <th className="p-4 border-l-[2.5px] border-black">مدل هوش مصنوعی</th>
                <th className="p-4 border-l-[2.5px] border-black">{activeTab === "text" ? "درک زبان فارسی" : "سبک تصویر"}</th>
                <th className="p-4 border-l-[2.5px] border-black">{activeTab === "text" ? "کدنویسی" : "کیفیت تصویر"}</th>
                <th className="p-4 border-l-[2.5px] border-black">{activeTab === "text" ? "سرعت پاسخ‌گویی" : "سرعت تولید"}</th>
                <th className="p-4">لینک خرید</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData[activeTab]?.map((item, idx) => (
                <tr key={idx} className="border-x-[2.5px] border-b-[2.5px] border-black hover:bg-gray-50">
                  <td className="p-4 border-l-[2.5px] border-black flex items-center gap-3">
                    <div className="w-8 h-8 relative rounded overflow-hidden border border-black">
                      <Image src={item.img} alt={item.name} fill className="object-cover" />
                    </div>
                    <span className="font-black text-base">{item.name}</span>
                  </td>
                  <td className="p-4 border-l-[2.5px] border-black text-emerald-700">{item.col1}</td>
                  <td className="p-4 border-l-[2.5px] border-black text-blue-700">{item.col2}</td>
                  <td className="p-4 border-l-[2.5px] border-black">{item.col3}</td>
                  <td className="p-4">
                    <Link
                      href={item.link}
                      className="bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1 hover:bg-gray-800"
                    >
                      مشاهده پلن‌ها <ArrowLeft className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}