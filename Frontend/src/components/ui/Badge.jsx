import { cn } from "../../lib/utils";

export default function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-cyan-300 text-black",
    success: "bg-emerald-400 text-black",
    warning: "bg-amber-300 text-black",
    danger: "bg-rose-400 text-black",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-bold font-farsi border border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
