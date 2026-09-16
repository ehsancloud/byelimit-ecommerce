// Frontend/src/components/products/ProductPageClient.jsx
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
import Breadcrumb from "../common/Breadcrumb";
import { useCart } from "../../context/CartContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// استایل های اختصاصی رندر مارکداون در تب توضیحات طبق الزامات دیزاین
const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h2 className="my-4 block text-xl font-bold text-black border-b-[2px] border-black/10 pb-2" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="my-4 block text-lg font-bold text-black" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="my-3 block text-base font-bold text-black" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="my-2 block text-sm font-bold text-black" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-4 leading-relaxed text-gray-800 font-medium last:mb-0" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pr-5 my-2 space-y-1.5 marker:text-black" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pr-5 my-2 space-y-1.5 marker:font-bold marker:text-black" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-relaxed text-gray-800 font-medium pl-1" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-black" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-r-4 border-[#12e2a3] bg-[#f8f9fa] pr-4 pl-3 py-2.5 my-3 rounded-l-lg text-gray-700 font-medium" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-blue-600 hover:text-blue-800 underline underline-offset-4 font-bold transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="w-full my-4 overflow-x-auto rounded-xl border-[2.5px] border-black shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
      <table className="w-full border-collapse text-xs sm:text-sm bg-white" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-[#12e2a3] border-b-[2px] border-black font-black text-black" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="p-2.5 text-right font-black border-l border-black/20 last:border-l-0" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="p-2.5 text-right font-medium border-t border-gray-200 border-l border-gray-200 last:border-l-0" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="even:bg-gray-50/80 hover:bg-emerald-50/30 transition-colors" {...props} />
  ),
  code: ({ node, className, children, ...props }) => (
    <code className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 text-xs font-mono text-purple-700 dir-ltr inline-block" {...props}>
      {children}
    </code>
  ),
  pre: ({ node, ...props }) => (
    <pre className="bg-[#1e1e1e] text-emerald-400 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono dir-ltr border-[2px] border-black" {...props} />
  ),
};

export default function ProductPageClient({ product }) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.isPopular) || product.variants[0],
  );
  const [activeTab, setActiveTab] = useState("description");
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [claudeSecureAddon, setClaudeSecureAddon] = useState(false);
  const CLAUDE_SECURE_ADDON_TOMAN = 1495000;
  const [addToCartError, setAddToCartError] = useState("");

  const finalUnitPrice = useMemo(() => {
    const basePrice = selectedVariant?.price || 0;
    return claudeSecureAddon ? basePrice + CLAUDE_SECURE_ADDON_TOMAN : basePrice;
  }, [selectedVariant, claudeSecureAddon]);

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setAddToCartError("");
    try {
      await addItem(product, selectedVariant, {
        hasSecureAddon: claudeSecureAddon,
        addonPriceToman: claudeSecureAddon ? CLAUDE_SECURE_ADDON_TOMAN : 0,
      });
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
        <div className="mb-4 sm:mb-6">
          <Breadcrumb productTitle={product.title} />
        </div>

        <ProductHero
          product={product}
          selectedVariant={selectedVariant}
          onSelectVariant={handleSelectVariant}
          finalUnitPrice={finalUnitPrice}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          addToCartError={addToCartError}
          isClaude={product.slug?.includes("claude") || product.category === "text"}
          claudeSecureAddon={claudeSecureAddon}
          onToggleClaudeAddon={setClaudeSecureAddon}
          claudeAddonPrice={CLAUDE_SECURE_ADDON_TOMAN}
        />

        {/* تب ها */}
        <div className="bg-white border-[3.5px] border-black rounded-2xl overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)] mb-10">
          <div className="flex items-stretch overflow-x-auto border-b-[3.5px] border-black bg-gray-100 scrollbar-none">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "description" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              توضیحات و کاربردها
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "comparison" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              مقایسه شفاف پلن ها
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-6 py-4 font-black text-xs md:text-sm border-l-[3.5px] border-black whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "faq" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              سوالات متداول ({product.faqs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-black text-xs md:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "reviews" ? "bg-[#12e2a3]" : "hover:bg-gray-200"
              }`}
            >
              نظرات خریداران ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className={activeTab === "description" ? "block" : "hidden"}>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base md:text-lg font-black text-black mb-4 pb-2 border-b border-black/10">
                    معرفی کامل سرویس {product.title}
                  </h3>
                  {product.longDescription ? (
                    <div className="dir-rtl font-[family-name:var(--font-farsi)] text-xs sm:text-sm text-gray-800 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={markdownComponents}
                      >
                        {product.longDescription}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 font-bold text-xs sm:text-sm py-4">
                      توضیحاتی برای این محصول ثبت نشده است.
                    </p>
                  )}
                </div>

                {product.demoVideoUrl && (
                  <div className="bg-[#f3f3f3] border-[2.5px] border-black rounded-xl p-4">
                    <h4 className="font-black text-sm mb-3 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-purple-600" />
                      <span>ویدیو راهنما و دموی محیط ابزار:</span>
                    </h4>
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border-[2px] border-black">
                      <video controls preload="none" className="w-full h-full object-cover">
                        <source src={product.demoVideoUrl} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={activeTab === "comparison" ? "block" : "hidden"}>
              <PlanComparisonTable data={product.comparisonTable || []} />
            </div>

            <div className={activeTab === "faq" ? "block" : "hidden"}>
              <FaqAccordion faqs={product.faqs || []} />
            </div>

            <div className={activeTab === "reviews" ? "block" : "hidden"}>
              <ProductReviews
                reviews={product.reviews || []}
                average={product.ratingAverage}
                count={product.ratingCount}
                productId={product.id}
              />
            </div>
          </div>
        </div>

        {/* پشتیبانی تلگرام */}
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
                پشتیبان های بای لیمیت هرروز ساعت ۱۰ تا ۲۲ پاسخگوی شما هستند.
              </p>
            </div>
          </div>
          <a
            href="tg://resolve?domain=byelimit_support"
            className="bg-white border-[2.5px] border-black px-6 py-2.5 rounded-xl font-black text-xs md:text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] hover:bg-yellow-200 transition-all shrink-0 no-underline text-black"
          >
            ارتباط مستقیم با پشتیبانی
          </a>
        </div>
      </main>

      <StickyMobileBar
        selectedVariant={selectedVariant}
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