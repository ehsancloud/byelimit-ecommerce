// Frontend/src/components/product/PlanComparisonTable.jsx
"use client";

import { Check, X } from "lucide-react";

function renderValue(val) {
  if (val === true) {
    return (
      <div className="inline-flex items-center justify-center bg-[#12e2a3] border-[1.5px] border-black p-1 rounded-md shadow-[-1px_1px_0_0_rgba(0,0,0,1)]">
        <Check className="w-4 h-4 text-black stroke-[3]" />
      </div>
    );
  }
  if (val === false) {
    return (
      <div className="inline-flex items-center justify-center bg-[#ff4757] border-[1.5px] border-black p-1 rounded-md shadow-[-1px_1px_0_0_rgba(0,0,0,1)]">
        <X className="w-4 h-4 text-white stroke-[3]" />
      </div>
    );
  }
  return <span>{val}</span>;
}

export default function PlanComparisonTable({ data }) {
  let tableData = data;
  if (typeof tableData === "string") {
    try {
      tableData = JSON.parse(tableData);
    } catch {
      tableData = null;
    }
  }

  if (!tableData) return null;

  // حالت اول: ساختار استاندارد ستون‌ها و ردیف‌ها ({ columns, rows })
  const isColumnar = tableData && Array.isArray(tableData.columns) && Array.isArray(tableData.rows);

  // حالت دوم: آرایه آبجکت‌ها ([{ feature, shared, exclusive }])
  const isLegacyArray = Array.isArray(tableData) && tableData.length > 0;

  if (!isColumnar && !isLegacyArray) return null;

  const columns = isColumnar
    ? tableData.columns
    : ["ویژگی / فاکتور", "پلن اشتراکی (اقتصادی)", "پلن اختصاصی (کاملاً شخصی)"];

  return (
    <div>
      <h3 className="text-base md:text-lg font-black text-black mb-4">
        جدول مقایسه پلن‌ها و امکانات
      </h3>
      <div className="overflow-x-auto border-[2.5px] border-black rounded-xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
        <table className="w-full text-right text-xs md:text-sm font-bold">
          <thead className="bg-[#ccff00] border-b-[2.5px] border-black font-black">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-3.5 ${
                    idx < columns.length - 1 ? "border-l-[2px] border-black" : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-black bg-white">
            {isColumnar &&
              tableData.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3.5 font-black border-l-[2px] border-black">
                    {row.feature}
                  </td>
                  {row.values?.map((val, vIdx) => (
                    <td
                      key={vIdx}
                      className={`p-3.5 ${
                        vIdx < row.values.length - 1 ? "border-l-[2px] border-black" : ""
                      }`}
                    >
                      {renderValue(val)}
                    </td>
                  ))}
                </tr>
              ))}

            {isLegacyArray &&
              tableData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3.5 font-black border-l-[2px] border-black">
                    {row.feature}
                  </td>
                  <td className="p-3.5 border-l-[2px] border-black text-gray-700">
                    {renderValue(row.shared)}
                  </td>
                  <td className="p-3.5 font-black text-emerald-700">
                    {renderValue(row.exclusive)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}