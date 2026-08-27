// src/components/checkout/InvoiceView.jsx
"use client";

import { Printer, ShieldCheck } from "lucide-react";

export default function InvoiceView({ invoiceData }) {
  const {
    orderId = "BL-98421",
    date = "۱۴۰۵/۰۵/۲۳",
    mobile = "۰۹۱۲۳۴۵۶۷۸۹",
    fullName = "کاربر محترم",
    productTitle = "اکانت اختصاصی ChatGPT Plus",
    variantName = "پلن اختصاصی ۱۰۰٪ شخصی",
    price = 1250000,
    discount = 0,
    status = "PAID", // PAID | PENDING
  } = invoiceData || {};

  const finalPrice = price - discount;

  return (
    <div className="bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      {/* هدر فاکتور */}
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
        <div>
          <h2 className="text-xl font-black">صورت‌حساب رسمی فروش</h2>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            فروشگاه اختصاصی بای لیمیت
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 border-[2px] border-black px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-[-2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ فاکتور</span>
        </button>
      </div>

      {/* اطلاعات فاکتور */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl text-xs font-bold mb-6">
        <div>
          <span className="text-gray-500 block">شماره سفارش:</span>
          <span className="font-black text-black dir-ltr block mt-0.5">
            {orderId}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">تاریخ ثبت:</span>
          <span className="font-black text-black block mt-0.5">{date}</span>
        </div>
        <div>
          <span className="text-gray-500 block">شماره خریدار:</span>
          <span className="font-black text-black block mt-0.5">{mobile}</span>
        </div>
        <div>
          <span className="text-gray-500 block">وضعیت فاکتور:</span>
          <span
            className={`font-black block mt-0.5 ${status === "PAID" ? "text-emerald-700" : "text-amber-600"}`}
          >
            {status === "PAID" ? "پرداخت موفق" : "در انتظار پرداخت"}
          </span>
        </div>
      </div>

      {/* جدول اقلام فاکتور */}
      <div className="overflow-x-auto border-[2px] border-black rounded-xl mb-6">
        <table className="w-full text-right text-xs md:text-sm font-bold">
          <thead className="bg-[#ccff00] border-b-[2px] border-black font-black">
            <tr>
              <th className="p-3 border-l-[2px] border-black">
                شرح محصول / پلن
              </th>
              <th className="p-3 border-l-[2px] border-black">تعداد</th>
              <th className="p-3">مبلغ کل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-l-[2px] border-black">
                <div className="font-black text-black">{productTitle}</div>
                <div className="text-[11px] text-gray-600">{variantName}</div>
              </td>
              <td className="p-3 border-l-[2px] border-black font-black">
                ۱ عدد
              </td>
              <td className="p-3 font-black">
                {price.toLocaleString("fa-IR")} تومان
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* محاسبات نهایی */}
      <div className="flex flex-col items-end gap-1.5 text-xs font-bold text-gray-800 border-t-[2px] border-black pt-4">
        {discount > 0 && (
          <div className="flex justify-between w-48 text-emerald-700">
            <span>تخفیف:</span>
            <span>- {discount.toLocaleString("fa-IR")} تومان</span>
          </div>
        )}
        <div className="flex justify-between w-48 text-sm font-black text-black border-t border-gray-300 pt-2">
          <span>مبلغ نهایی:</span>
          <span>{finalPrice.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
    </div>
  );
}
