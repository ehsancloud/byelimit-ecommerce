// src/components/product/PlanComparisonTable.jsx
"use client";

export default function PlanComparisonTable({ data }) {
  return (
    <div>
      <h3 className="text-base md:text-lg font-black text-black mb-4">
        جدول مقایسه پلن اختصاصی در برابر پلن اشتراکی
      </h3>
      <div className="overflow-x-auto border-[2.5px] border-black rounded-xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
        <table className="w-full text-right text-xs md:text-sm font-bold">
          <thead className="bg-[#ccff00] border-b-[2.5px] border-black font-black">
            <tr>
              <th className="p-3.5 border-l-[2px] border-black">
                ویژگی / فاکتور
              </th>
              <th className="p-3.5 border-l-[2px] border-black">
                پلن اشتراکی (اقتصادی)
              </th>
              <th className="p-3.5">پلن اختصاصی (کاملاً شخصی)</th>
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-black">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3.5 font-black border-l-[2px] border-black">
                  {row.feature}
                </td>
                <td className="p-3.5 border-l-[2px] border-black text-gray-700">
                  {row.shared}
                </td>
                <td className="p-3.5 font-black text-emerald-700">
                  {row.exclusive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
