// components/products/Filters.jsx
import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "popular", label: "محبوب‌ترین‌ها" },
  { value: "newest", label: "جدیدترین‌ها" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
];

export default function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  onReset,
  mobile = false,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const MIN = 0;
  const MAX = 50000000; // 50 million تومان
  const STEP = 10000;

  const handleRangeChange = (which, value) => {
    // expects value as number
    let newRange = { ...(priceRange || { min: MIN, max: MAX }) };
    if (which === "min") newRange.min = Math.min(Math.max(value, MIN), newRange.max);
    if (which === "max") newRange.max = Math.max(Math.min(value, MAX), newRange.min);
    setPriceRange(newRange);
  };

  return (
    // تغییر sticky top-6 به sticky top-24 جهت نرفتن زیر هدر چسبان
    <aside className={`w-full bg-white border-[3px] border-black rounded-[16px] ${mobile ? "p-3 gap-3" : "p-5 gap-6 sticky top-20"} shadow-[-6px_6px_0_0_rgba(0,0,0,1)] dir-rtl flex flex-col z-10 transition-all duration-300`}>
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

      {/* چینش بر اساس - custom neobrutal dropdown */}
      <div>
        <label className="block font-black text-sm mb-2">مرتب‌سازی بر اساس:</label>

        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((s) => !s)}
            className="w-full bg-[#f3f3f3] border-[3px] border-black rounded-xl p-2.5 font-black text-sm flex items-center justify-between cursor-pointer shadow-[-4px_4px_0_0_rgba(0,0,0,1)]"
            aria-expanded={sortOpen}
          >
            <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "مرتب سازی"}</span>
            <ChevronDown className={`w-4 h-4 stroke-[3] transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>

          {sortOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border-[3px] border-black rounded-xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] z-30 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                  className="w-full text-right px-4 py-2 font-black text-sm hover:bg-gray-100"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* فیلتر کاربرد / دسته‌بندی */}
      <div>
        <label className="block font-black text-sm mb-2">کاربرد و حوزه:</label>
        <div className={`gap-2 ${mobile ? "grid grid-cols-2" : "flex flex-col"}`}>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer select-none"
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
          <label className="font-black text-sm">بازه قیمت:</label>
          <span className="font-extrabold text-xs bg-[#ccff00] border border-black px-2 py-0.5 rounded">
            {Number(priceRange?.min || 0).toLocaleString("fa-IR")} — {Number(priceRange?.max || MAX).toLocaleString("fa-IR")} تومان
          </span>
        </div>

        {/* double range sliders (two handles) */}
        <div className="relative">
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={priceRange?.min ?? MIN}
            onChange={(e) => handleRangeChange("min", Number(e.target.value))}
            className="w-full appearance-none h-2 bg-transparent absolute top-1/2 transform -translate-y-1/2"
          />
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={priceRange?.max ?? MAX}
            onChange={(e) => handleRangeChange("max", Number(e.target.value))}
            className="w-full appearance-none h-2 bg-transparent absolute top-1/2 transform -translate-y-1/2"
          />

          {/* visual track */}
          <div className="h-2 bg-[#e6e6e6] rounded-full mt-2"></div>
        </div>

        {/* Manual inputs */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1">
            <label className="text-[11px] font-bold mb-1 block">حداقل (تومان)</label>
            <input
              type="number"
              min={MIN}
              max={priceRange?.max ?? MAX}
              step={STEP}
              value={priceRange?.min ?? MIN}
              onChange={(e) => handleRangeChange("min", Number(e.target.value || 0))}
              className="w-full bg-[#f8f9fa] border-[2.5px] border-black rounded-lg p-2 font-bold text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-bold mb-1 block">حداکثر (تومان)</label>
            <input
              type="number"
              min={priceRange?.min ?? MIN}
              max={MAX}
              step={STEP}
              value={priceRange?.max ?? MAX}
              onChange={(e) => handleRangeChange("max", Number(e.target.value || 0))}
              className="w-full bg-[#f8f9fa] border-[2.5px] border-black rounded-lg p-2 font-bold text-sm outline-none"
            />
          </div>
        </div>

      </div>
    </aside>
  );
}
