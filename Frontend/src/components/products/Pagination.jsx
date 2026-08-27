import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 dir-rtl">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 bg-white border-[2.5px] border-black rounded-lg shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed hover:bg-[#ccff00] transition-colors"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {[...Array(totalPages)].map((_, idx) => {
        const pageNum = idx + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 border-[2.5px] border-black rounded-lg font-black text-sm transition-all ${
              isActive
                ? "bg-[#12e2a3] shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {pageNum.toLocaleString("fa-IR")}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 bg-white border-[2.5px] border-black rounded-lg shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed hover:bg-[#ccff00] transition-colors"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
