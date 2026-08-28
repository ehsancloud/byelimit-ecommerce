// src/components/products/ProductsPageClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import Filters from "./Filters";
import MobileFilterDrawer from "./MobileFilterDrawer";
import Pagination from "./Pagination";
import SeoSection from "./SeoSection";
import { CATEGORIES, getAllProducts, toProductCardProps } from "../../data/products";

const ITEMS_PER_PAGE = 10;

export default function ProductsPageClient({ initialSearch = "" }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [rawProducts, setRawProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setSearchQuery(initialSearch);
    setCurrentPage(1);
  }, [initialSearch]);

  // فیلتر دسته و جست‌وجو سمت سرور (بک‌اند) انجام می‌شود؛ قیمت/مرتب‌سازی سمت کلاینت
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError("");

    getAllProducts({ category: selectedCategory, search: searchQuery })
      .then((products) => {
        if (!cancelled) setRawProducts(products);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "خطا در دریافت محصولات از سرور.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSortBy("popular");
    setPriceRange({ min: 0, max: 50000000 });
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    router.replace("/products");
  };

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((prod) => {
        const pricedVariants = prod.variants.filter(
          (v) => typeof v.price === "number" && !v.priceTBD,
        );
        const cheapestPrice = pricedVariants.length
          ? Math.min(...pricedVariants.map((v) => v.price))
          : null;
        // محصولات بدون قیمت نهایی (به‌زودی) همیشه نمایش داده می‌شوند
        if (cheapestPrice === null) return true;
        const min = priceRange?.min ?? 0;
        const max = priceRange?.max ?? Infinity;
        return cheapestPrice >= min && cheapestPrice <= max;
      })
      .map(toProductCardProps)
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "newest") return String(b.id).localeCompare(String(a.id));
        return b.ratingNum - a.ratingNum; // popular
      });
  }, [rawProducts, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const filterProps = {
    categories: CATEGORIES,
    selectedCategory,
    setSelectedCategory: (cat) => { setSelectedCategory(cat); setCurrentPage(1); },
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange: (val) => { setPriceRange(val); setCurrentPage(1); },
    onReset: handleResetFilters,
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-5 sm:p-8 md:p-12 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <div className="max-w-7xl mx-auto">

        {/* عنوان صفحه */}
        <header className="mb-8 text-center md:text-right">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            فروشگاه اکانت‌های هوش مصنوعی
          </h1>
          <p className="text-gray-700 font-bold text-sm md:text-base">
            خرید مستقیم و اختصاصی تمامی ابزارهای AI با تحویل سریع و پشتیبانی کامل
          </p>

          {searchQuery && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white border-[2.5px] border-black px-3 py-1.5 rounded-xl text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              <span>نتایج جست‌وجو برای: «{searchQuery}»</span>
              <button
                onClick={handleClearSearch}
                className="p-0.5 hover:bg-gray-100 rounded cursor-pointer"
                aria-label="پاک کردن جست‌وجو"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </header>

        {/* بخش اصلی: فیلترها + شبکه محصولات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">

          {/* فیلترهای دسکتاپ */}
          <div className="hidden md:block md:col-span-1 sticky top-20">
            <Filters {...filterProps} />
          </div>

          {/* شبکه محصولات (Grid) */}
          <div className="col-span-1 md:col-span-3">
            {isLoading ? (
              <div className="bg-white border-[3px] border-black rounded-[16px] p-12 text-center font-black text-sm shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال بارگذاری محصولات...</span>
              </div>
            ) : loadError ? (
              <div className="bg-rose-50 border-[3px] border-black rounded-[16px] p-12 text-center font-black text-sm shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] text-rose-700">
                {loadError}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-[3px] border-black rounded-[16px] p-12 text-center font-black text-lg shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)]">
                هیچ محصولی با مشخصات انتخابی یافت نشد!
              </div>
            )}

            {/* صفحه‌بندی ۱۰ تایی */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>

        {/* بخش سئو و جدول مقایسه‌ای پایین صفحه */}
        <SeoSection />

        {/* فیلتر کشویی موبایل */}
        <MobileFilterDrawer
          isOpen={isMobileFilterOpen}
          setIsOpen={setIsMobileFilterOpen}
          filterProps={filterProps}
        />
      </div>
    </main>
  );
}
