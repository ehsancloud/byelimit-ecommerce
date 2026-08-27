"use client";
import { cn } from "../../lib/utils";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  const baseStyles =
    "font-farsi font-bold border-2 border-black rounded-lg transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer select-none";

  const variants = {
    primary:
      "bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300",
    secondary:
      "bg-purple-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-300",
    outline:
      "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100",
    danger:
      "bg-rose-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
