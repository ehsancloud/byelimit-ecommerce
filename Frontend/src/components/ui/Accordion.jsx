"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Accordion({ title, children, className }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "border-2 border-black rounded-lg bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-farsi overflow-hidden",
        className,
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-amber-100 text-right font-bold text-sm text-black cursor-pointer select-none"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-t-2 border-black text-sm text-gray-800 leading-relaxed text-right">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
