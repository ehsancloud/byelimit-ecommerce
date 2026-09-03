// Frontend/src/components/layout/header/Navbar.jsx
"use client";

import CartIcon from "../../cart/CartIcon";
import DollarBox from "./DollarBox";

export default function Navbar() {
  return (
    <nav className="hidden md:flex items-stretch h-full">
      {/* اول سبد خرید (سمت راست‌تر) و سپس نرخ دلار (سمت چپ‌تر، متصل به پنل کاربری) */}
      <CartIcon variant="desktop" />
      <DollarBox />
    </nav>
  );
}