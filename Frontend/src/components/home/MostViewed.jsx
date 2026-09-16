// src/components/home/MostViewed.jsx
"use client";

import { useState, useEffect } from "react";
import ProductCard from "../products/ProductCard";
import { Eye } from "lucide-react";
import { getMostViewedProducts, getAllProducts, toProductCardProps } from "../../data/products";

export default function MostViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getMostViewedProducts()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data
            .filter((p) => !p.slug?.toLowerCase().includes("test") && !p.title?.includes("تست"))
            .slice(0, 4);
          setProducts(filtered.map(toProductCardProps));
        } else {
          // فال‌بک به getAllProducts با مرتب‌سازی cartItemsCount
          return getAllProducts().then((allProds) => {
            if (cancelled) return;
            const top = (allProds || [])
              .filter((p) => !p.slug?.toLowerCase().includes("test") && !p.title?.includes("تست"))
              .sort((a, b) => (b.cartItemsCount || 0) - (a.cartItemsCount || 0))
              .slice(0, 4);
            setProducts(top.map(toProductCardProps));
          });
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b-[3.5px] border-black pb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 stroke-[2.5] text-cyan-600" />
          <h2 className="text-xl sm:text-2xl font-black">
            پربازدیدترین و داغ‌ترین محصولات
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
