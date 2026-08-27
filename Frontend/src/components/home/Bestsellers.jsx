// src/components/home/Bestsellers.jsx
"use client";

import { useState, useEffect } from "react";
import ProductCard from "../products/ProductCard";
import { Flame } from "lucide-react";
import { getAllProducts, toProductCardProps } from "../../data/products";

export default function Bestsellers() {
  const [bestProducts, setBestProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAllProducts()
      .then((products) => {
        if (cancelled) return;
        const top = products
          .filter((p) => p.totalSalesCount > 0)
          .sort((a, b) => b.totalSalesCount - a.totalSalesCount)
          .slice(0, 4)
          .map(toProductCardProps);
        setBestProducts(top);
      })
      .catch(() => {
        // اگر بک‌اند در دسترس نبود، این بخش صرفاً نمایش داده نمی‌شود (بدون شکستن صفحه اصلی)
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // تا فروش واقعی رخ ندهد، این بخش عمداً نمایش داده نمی‌شود (بدون آمار جعلی)
  if (bestProducts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b-[3.5px] border-black pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 stroke-[2.5] text-orange-500 fill-orange-500" />
          <h2 className="text-2xl font-black">
            پرفروش‌ترین و محبوب‌ترین اکانت‌ها
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bestProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
