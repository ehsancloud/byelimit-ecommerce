"use client";
import { cn } from "../../lib/utils";

export default function Input({
  label,
  error,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 text-right font-farsi w-full">
      {label && (
        <label className="text-xs font-bold text-black select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute right-3.5 text-gray-700 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={cn(
            "w-full bg-white border-2 border-black rounded-lg px-4 py-2.5 text-sm font-medium text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all",
            Icon && "pr-11",
            error && "border-rose-500 focus:ring-rose-400",
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-bold text-rose-600">{error}</span>
      )}
    </div>
  );
}
