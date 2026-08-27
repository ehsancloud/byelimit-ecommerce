import { cn } from "../../lib/utils";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-black rounded-xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] font-farsi text-right",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
