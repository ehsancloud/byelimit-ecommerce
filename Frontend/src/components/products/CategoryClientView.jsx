// src/components/products/CategoryClientView.jsx
"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import Filters from "./Filters";
import MobileFilterDrawer from "./MobileFilterDrawer";
import Pagination from "./Pagination";

const CATEGORIES = [
  { id: "all", name: "همه ابزارهای این دسته‌بندی" },
  { id: "text", name: "تولید متن و چت‌بات" },
  { id: "code", name: "کدنویسی و برنامه‌نویسی" },
  { id: "image", name: "تولید تصویر و طراحی" },
  { id: "video", name: "ساخت و ادیت ویدیو" },
  { id: "audio", name: "صدا و تولید موسیقی" },
  { id: "research", name: "تحقیق و آموزش" },
];

const ITEMS_PER_PAGE = 10;

export default function CategoryClientView({ categoryInfo, products }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState(3000000);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSortBy("popular");
    setPriceRange(3000000);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchCat =
          selectedCategory === "all" || prod.category === selectedCategory;
        // محصولات بدون قیمت نهایی (به‌زودی) همیشه نمایش داده می‌شوند، مستقل از اسلایدر قیمت
        const matchPrice = prod.priceTBD || prod.priceNum <= priceRange;
        return matchCat && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "newest") return String(b.id).localeCompare(String(a.id));
        return b.ratingNum - a.ratingNum;
      });
  }, [products, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const filterProps = {
    categories: CATEGORIES,
    selectedCategory,
    setSelectedCategory: (cat) => {
      setSelectedCategory(cat);
      setCurrentPage(1);
    },
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange: (val) => {
      setPriceRange(val);
      setCurrentPage(1);
    },
    onReset: handleResetFilters,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* هدر دسته‌بندی */}
      <header className="mb-8 border-b-[3.5px] border-black pb-4 text-center md:text-right">
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          {categoryInfo.titleFa}
        </h1>
        <p className="text-gray-700 font-bold text-sm md:text-base">
          خرید مستقیم و اختصاصی ابزارهای مرتبط با این حوزه با تحویل فوری و ضمانت
          کامل
        </p>
      </header>

      {/* بخش اصلی: فیلترها و محصولات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        <div className="hidden md:block md:col-span-1 sticky top-24 z-10">
          <Filters {...filterProps} />
        </div>

        <div className="col-span-1 md:col-span-3">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-[3px] border-black rounded-[16px] p-12 text-center font-black text-lg shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
              هیچ محصولی با فیلترهای انتخابی یافت نشد!
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* مقاله اختصاصی سئو در پایین صفحه */}
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
