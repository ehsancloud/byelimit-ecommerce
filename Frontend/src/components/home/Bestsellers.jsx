// src/components/home/Bestsellers.jsx
"use client";

import { useState, useEffect } from "react";
import ProductCard from "../products/ProductCard";
import { Flame } from "lucide-react";
import { getBestsellerProducts, getAllProducts, toProductCardProps } from "../../data/products";

export default function Bestsellers() {
  const [bestProducts, setBestProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getBestsellerProducts()
      .then((products) => {
        if (cancelled) return;
        if (Array.isArray(products) && products.length > 0) {
          const filtered = products
            .filter((p) => !p.slug?.toLowerCase().includes("test") && !p.title?.includes("تست"))
            .slice(0, 4);
          setBestProducts(filtered.map(toProductCardProps));
        } else {
          // فال بک به getAllProducts با مرتب سازی orderItemsCount
          return getAllProducts().then((allProds) => {
            if (cancelled) return;
            const top = (allProds || [])
              .filter((p) => !p.slug?.toLowerCase().includes("test") && !p.title?.includes("تست"))
              .sort((a, b) => (b.orderItemsCount || b.totalSalesCount || 0) - (a.orderItemsCount || a.totalSalesCount || 0))
              .slice(0, 4);
            setBestProducts(top.map(toProductCardProps));
          });
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  if (bestProducts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b-[3.5px] border-black pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 stroke-[2.5] text-orange-500 fill-orange-500" />
          <h2 className="text-xl sm:text-2xl font-black">
            پرفروش ترین و محبوب ترین اکانت ها
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {bestProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}