// Frontend/src/components/layout/header/Navbar.jsx
"use client";

import CartIcon from "../../cart/CartIcon";
import DollarBox from "./DollarBox";

export default function Navbar() {
  return (
    <nav className="hidden md:flex items-stretch h-full border-r-[3.5px] border-black">
      {/* اول سبد خرید و سپس نرخ دلار (متصل به پنل کاربری) */}
      <CartIcon variant="desktop" />
      <DollarBox />
    </nav>
  );
}
