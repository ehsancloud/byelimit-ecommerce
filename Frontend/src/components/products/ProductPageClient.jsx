// src/components/products/ProductPageClient.jsx
"use client";

import { useState, useMemo } from "react";
import { PlayCircle, MessageCircle } from "lucide-react";
import ProductHero from "./ProductHero";
import PlanComparisonTable from "./PlanComparisonTable";
import FaqAccordion from "./FaqAccordion";
import ProductReviews from "./ProductReviews";
import LivePurchasePopup from "./LivePurchasePopup";
import StickyMobileBar from "./StickyMobileBar";
import AddedToCartModal from "../cart/AddedToCartModal";
import { useCart } from "../../context/CartContext";

export default function ProductPageClient({ product }) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.isPopular) || product.variants[0],
  );
  const [activeTab, setActiveTab] = useState("description");
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState("");

  // Pricing is based on variant price. Discounts are applied at order (checkout) level only.
  const finalUnitPrice = useMemo(() => selectedVariant.price, [selectedVariant]);

  // انتخاب پلن جدید یعنی کد تخفیف قبلی (که روی پلن قبلی محاسبه شده بود) دیگر معتبر نیست
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setAppliedDiscount(null);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setAddToCartError("");
    try {
      await addItem(product, selectedVariant);
      setIsCartModalOpen(true);
    } catch (err) {
      setAddToCartError(err.message || "افزودن به سبد خرید ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-[family-name:var(--font-farsi)] dir-rtl text-black pb-24 lg:pb-12 select-none">
      <LivePurchasePopup />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <ProductHero
          product={product}
          selectedVariant={selectedVariant}
          onSelectVariant={handleSelectVariant}
          appliedDiscount={appliedDiscount}
          onApplyDiscount={setAppliedDiscount}
          onRemoveDiscount={() => setAppliedDiscount(null)}
          finalUnitPrice={finalUnitPrice}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          addToCartError={addToCartError}
        />

        {/* بخش تب‌ها */}
        <div className="bg-white border-[3.5px] border-black rounded-2xl overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)] mb-10">
          <div className="flex items-stretch overflow-x-auto border-b-[3.5px] border-black bg-gray-100 scrollbar-none">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "description"
                  ? "bg-[#12e2a3]"
                  : "hover:bg-gray-200"
              }`}
            >
              توضیحات و کاربردها
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "comparison"
                  ? "bg-[#12e2a3]"
                  : "hover:bg-gray-200"
              }`}
            >
              مقایسه شفاف پلن‌ها
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "faq" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              سوالات متداول ({product.faqs.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-black text-xs md:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "reviews" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              نظرات خریداران ({product.reviews.length})
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "description" && (
              <div className="flex flex-col gap-6">
                <div className="prose text-xs md:text-sm font-bold text-gray-800 leading-relaxed max-w-none">
                  <h3 className="text-base md:text-lg font-black text-black mb-3">
                    معرفی کامل سرویس {product.title}
                  </h3>
                  <p className="mb-4">{product.longDescription}</p>
                </div>

                {product.demoVideoUrl && (
                  <div className="bg-[#f3f3f3] border-[2.5px] border-black rounded-xl p-4">
                    <h4 className="font-black text-sm mb-3 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-purple-600" />
                      <span>ویدیو راهنما و دموی محیط ابزار:</span>
                    </h4>
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border-[2px] border-black">
                      <video
                        controls
                        preload="none"
                        className="w-full h-full object-cover"
                      >
                        <source src={product.demoVideoUrl} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "comparison" && (
              <PlanComparisonTable data={product.comparisonTable} />
            )}

            {activeTab === "faq" && <FaqAccordion faqs={product.faqs} />}

            {activeTab === "reviews" && (
              <ProductReviews
                reviews={product.reviews}
                average={product.ratingAverage}
                count={product.ratingCount}
              />
            )}
          </div>
        </div>

        {/* چت آنلاین */}
        <div className="bg-[#12e2a3] border-[3.5px] border-black rounded-2xl p-6 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border-[2.5px] border-black rounded-xl shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
              <MessageCircle className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-sm md:text-base">
                نیاز به راهنمایی قبل از خرید دارید؟
              </h4>
              <p className="text-xs font-bold text-gray-800">
                پشتیبان‌های بای لیمیت هرروز ساعت ۱۰ تا ۲۲ پاسخگوی شما هستند.
              </p>
            </div>
          </div>
          <a
            href="https://t.me/byelimit_support"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-[2.5px] border-black px-6 py-2.5 rounded-xl font-black text-xs md:text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-yellow-200 transition-all shrink-0"
          >
            ارتباط مستقیم با پشتیبانی
          </a>
        </div>
      </main>

      <StickyMobileBar
        selectedVariant={selectedVariant}
        appliedDiscount={appliedDiscount}
        finalUnitPrice={finalUnitPrice}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
      />

      <AddedToCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </div>
  );
}
