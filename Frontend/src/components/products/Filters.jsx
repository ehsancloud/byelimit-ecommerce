// components/products/Filters.jsx
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  onReset,
}) {
  return (
    // تغییر sticky top-6 به sticky top-24 جهت نرفتن زیر هدر چسبان
    <aside className="w-full bg-white border-[3px] border-black rounded-[16px] p-5 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] dir-rtl flex flex-col gap-6 sticky top-20 z-10 transition-all duration-300">
      <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
        <div className="flex items-center gap-2 font-black text-xl">
          <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
          <span>فیلترها</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-gray-600 flex items-center gap-1 bg-[#f0f0f0] border-[2px] border-black px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          ریست
        </button>
      </div>

      {/* چینش بر اساس */}
      <div>
        <label className="block font-black text-sm mb-2">
          مرتب‌سازی بر اساس:
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-[#f2f4f8] border-[2.5px] border-black rounded-lg p-2.5 font-bold text-sm outline-none cursor-pointer focus:bg-white"
        >
          <option value="popular">محبوب‌ترین‌ها</option>
          <option value="newest">جدیدترین‌ها</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
        </select>
      </div>

      {/* فیلتر کاربرد / دسته‌بندی */}
      <div>
        <label className="block font-black text-sm mb-2">کاربرد و حوزه:</label>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 font-bold text-sm cursor-pointer select-none"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
                className="w-4 h-4 accent-[#12e2a3] cursor-pointer"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* فیلتر محدوده قیمت */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-black text-sm">حداکثر قیمت:</label>
          <span className="font-extrabold text-xs bg-[#ccff00] border border-black px-2 py-0.5 rounded">
            {Number(priceRange).toLocaleString("fa-IR")} تومان
          </span>
        </div>
        <input
          type="range"
          min="200000"
          max="3000000"
          step="100000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#12e2a3] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-1">
          <span>۲۰۰ هزار</span>
          <span>۳ میلیون</span>
        </div>
      </div>
    </aside>
  );
}
