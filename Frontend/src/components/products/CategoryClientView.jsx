"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import Filters from "./Filters";
import MobileFilterDrawer from "./MobileFilterDrawer";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 10;

export default function CategoryClientView({ categoryInfo, products }) {
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleResetFilters = () => {
    setSortBy("popular");
    setPriceRange({ min: 0, max: 50000000 });
    setCurrentPage(1);
  };

  // ✅ FIX: هنگام تغییر صفحه، اسکرول به بالا انجام می‌شود
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const min = priceRange?.min ?? 0;
        const max = priceRange?.max ?? Infinity;
        return prod.priceTBD || (prod.priceNum >= min && prod.priceNum <= max);
      })
      .sort((a, b) => {
        if (sortBy === "price-asc")  return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "newest")     return String(b.id).localeCompare(String(a.id));
        return b.ratingNum - a.ratingNum;
      });
  }, [products, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // ✅ FIX: پراپ‌های category حذف شدند چون Filters دیگر آن بخش را ندارد
  const filterProps = {
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange: (val) => { setPriceRange(val); setCurrentPage(1); },
    onReset: handleResetFilters,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 sm:p-8">
      {/* هدر دسته‌بندی */}
      <header className="mb-8 border-b-[3.5px] border-black pb-4 text-center md:text-right">
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          {categoryInfo.titleFa}
        </h1>
        <p className="text-gray-700 font-bold text-sm md:text-base">
          خرید مستقیم و اختصاصی ابزارهای مرتبط با این حوزه با تحویل فوری و ضمانت کامل
        </p>
      </header>

      {/* بخش اصلی: فیلترها و محصولات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        <div className="hidden md:block md:col-span-1 sticky top-24 z-10">
          <Filters {...filterProps} />
        </div>

        <div className="col-span-1 md:col-span-3">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-[3px] border-black rounded-[16px] p-12 text-center font-black text-lg shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
              هیچ محصولی با فیلترهای انتخابی یافت نشد!
            </div>
          )}

          {/* ✅ FIX: handlePageChange با scroll-to-top */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* مقاله سئو */}
      <article className="mt-16 bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl">
        <h2 className="text-xl md:text-2xl font-black mb-4 border-b-[3px] border-black pb-2 inline-block">
          {categoryInfo.seoArticle.heading}
        </h2>
        <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800 mb-4">
          {categoryInfo.seoArticle.paragraph1}
        </p>
        <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-700">
          {categoryInfo.seoArticle.paragraph2}
        </p>
      </article>

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        setIsOpen={setIsMobileFilterOpen}
        filterProps={filterProps}
      />
    </div>
  );
}
