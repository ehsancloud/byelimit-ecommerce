import { cn } from "../../lib/utils";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 border border-black/20 rounded-md",
        className,
      )}
      {...props}
    />
  );
}
