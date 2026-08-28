import { useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Filters from "./Filters";

export default function MobileFilterDrawer({ isOpen, setIsOpen, filterProps }) {
  // prevent body scroll while drawer is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* دکمه شناور فیلتر در فضای خالی پایینِ سمت چپ */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-[#ccff00] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
        aria-label="باز کردن فیلترها"
      >
        <SlidersHorizontal className="w-7 h-7 stroke-[2.5] text-black" />
      </button>

      {/* بک‌دراپ تاریک */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* منوی بازشونده از پایین */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f3f3f3] border-t-[4px] border-black rounded-t-[24px] p-4 transition-transform duration-300 overflow-hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4 border-b-[2px] border-black pb-3">
          <span className="font-black text-lg">فیلترهای جستجو</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 border-[2px] border-black rounded-md bg-white hover:bg-gray-100"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <Filters {...filterProps} mobile />

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-5 bg-[#12e2a3] border-[3px] border-black rounded-[10px] py-3 font-black text-base shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          اعمال و مشاهده محصولات
        </button>
      </div>
    </>
  );
}

