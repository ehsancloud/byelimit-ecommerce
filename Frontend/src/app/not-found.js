import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 font-[family-name:var(--font-farsi)] dir-rtl">
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-8 md:p-12 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] text-center max-w-md w-full flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4 stroke-[2.5]" />
        
        <h1 className="text-6xl font-black text-black tracking-tighter mb-2">۴۰۴</h1>
        <h2 className="text-xl md:text-2xl font-black mb-4">صفحه مورد نظر پیدا نشد</h2>
        
        <p className="text-sm font-bold text-gray-600 mb-8 leading-relaxed">
          متأسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد یا آدرس آن تغییر کرده است.
        </p>

        <Link
          href="/"
          className="bg-[#ccff00] border-[2.5px] border-black px-6 py-3 rounded-xl font-black text-sm text-black no-underline shadow-[-4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#b3e600] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all w-full"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
