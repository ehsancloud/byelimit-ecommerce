// Frontend/src/components/checkout/InvoiceView.jsx
"use client";

import { Printer, ShieldCheck } from "lucide-react";

export default function InvoiceView({ invoiceData }) {
  const {
    orderNumber = invoiceData?.orderId || "BL-98421",
    date = new Date().toLocaleDateString("fa-IR"),
    mobile = "۰۹۱۲۳۴۵۶۷۸۹",
    fullName = "مشتری گرامی",
    status = "PAID", // PAID | PENDING_PAYMENT
    items = [],
    discountToman = invoiceData?.discount || 0,
    totalToman = invoiceData?.price || 0,
  } = invoiceData || {};

  // پشتیبانی همزمان از سفارش‌های چندمحصولی و تک‌محصولی
  const resolvedItems = items.length > 0
    ? items
    : [{
        productTitle: invoiceData?.productTitle || "اکانت اختصاصی هوش مصنوعی",
        variantName: invoiceData?.variantName || "پلن اختصاصی",
        unitPrice: invoiceData?.price || 0,
        quantity: 1,
      }];

  const subtotalToman = resolvedItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0
  );

  const finalPriceToman = totalToman > 0
    ? totalToman
    : Math.max(0, subtotalToman - discountToman);

  return (
    <div className="bg-white border-[3.5px] border-black rounded-[20px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      {/* سربرگ فاکتور */}
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
        <div>
          <h2 className="text-xl font-black">صورت‌حساب رسمی سفارش</h2>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            فروشگاه تخصصی ابزارهای هوش مصنوعی بای لیمیت
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

      {/* اطلاعات مشخصات سفارش و خریدار */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl text-xs font-bold mb-6">
        <div>
          <span className="text-gray-500 block">شماره سفارش:</span>
          <span className="font-black text-black dir-ltr block mt-0.5">
            {orderNumber}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">تاریخ صدور:</span>
          <span className="font-black text-black block mt-0.5">{date}</span>
        </div>
        <div>
          <span className="text-gray-500 block">مشخصات خریدار:</span>
          <span className="font-black text-black block mt-0.5">{fullName || mobile}</span>
        </div>
        <div>
          <span className="text-gray-500 block">وضعیت سفارش:</span>
          <span
            className={`font-black block mt-0.5 ${
              status === "PAID" || status === "DELIVERED"
                ? "text-emerald-700"
                : "text-amber-600"
            }`}
          >
            {status === "PAID" || status === "DELIVERED" ? "پرداخت‌شده و معتبر" : "در انتظار پرداخت"}
          </span>
        </div>
      </div>

      {/* جدول پویا برای رندر تمام اقلام فاکتور */}
      <div className="overflow-x-auto border-[2px] border-black rounded-xl mb-6">
        <table className="w-full text-right text-xs md:text-sm font-bold">
          <thead className="bg-[#ccff00] border-b-[2px] border-black font-black">
            <tr>
              <th className="p-3 border-l-[2px] border-black">ردیف</th>
              <th className="p-3 border-l-[2px] border-black">شرح محصول / پلن اشتراک</th>
              <th className="p-3 border-l-[2px] border-black">تعداد</th>
              <th className="p-3">مبلغ واحد</th>
            </tr>
          </thead>
          <tbody>
            {resolvedItems.map((item, idx) => (
              <tr key={idx} className="border-b last:border-b-0 border-gray-200">
                <td className="p-3 border-l-[2px] border-black font-black text-center w-12">
                  {(idx + 1).toLocaleString("fa-IR")}
                </td>
                <td className="p-3 border-l-[2px] border-black">
                  <div className="font-black text-black">{item.productTitle}</div>
                  <div className="text-[11px] text-gray-600">{item.variantName}</div>
                </td>
                <td className="p-3 border-l-[2px] border-black font-black text-center w-16">
                  {(item.quantity || 1).toLocaleString("fa-IR")}
                </td>
                <td className="p-3 font-black">
                  {(item.unitPrice || 0).toLocaleString("fa-IR")} تومان
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* محاسبات مبالغ نهایی */}
      <div className="flex flex-col items-end gap-1.5 text-xs font-bold text-gray-800 border-t-[2px] border-black pt-4">
        <div className="flex justify-between w-56 text-gray-600">
          <span>جمع کل اقلام:</span>
          <span>{subtotalToman.toLocaleString("fa-IR")} تومان</span>
        </div>
        {discountToman > 0 && (
          <div className="flex justify-between w-56 text-emerald-700">
            <span>تخفیف اعمال‌شده:</span>
            <span>- {discountToman.toLocaleString("fa-IR")} تومان</span>
          </div>
        )}
        <div className="flex justify-between w-56 text-sm font-black text-black border-t border-gray-300 pt-2 mt-1">
          <span>مبلغ پرداخت نهایی:</span>
          <span className="text-base text-emerald-600">{finalPriceToman.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
    </div>
  );
}