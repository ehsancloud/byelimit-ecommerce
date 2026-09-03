// Frontend/src/components/layout/header/Navbar.jsx
"use client";

import CartIcon from "../../cart/CartIcon";
import DollarBox from "./DollarBox";

export default function Navbar() {
  return (
    <nav className="hidden md:flex items-stretch h-full">
      {/* نمایش نرخ زنده دلار دقیقاً در محل قبلی سربرگ خدمات */}
      <DollarBox />
      <CartIcon variant="desktop" />
    </nav>
  );
}