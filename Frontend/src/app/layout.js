import localFont from "next/font/local";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import FloatingSupport from "../components/layout/FloatingSupport";
import { CartProvider } from "../context/CartContext";
import "./globals.css";

const fontFarsi = localFont({
  src: [
    {
      path: "./fonts/Modam-Bold.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Modam-Black.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-farsi",
});

export const metadata = {
  metadataBase: new URL("https://byelimit.ir"),
  title: "8640838",
  description:
    "خرید اکانت‌های اختصاصی و قانونی هوش مصنوعی (ChatGPT، Claude، Midjourney و...) با تحویل سریع و ضمانت ۱۰۰٪.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={fontFarsi.variable}>
      <body className="font-[family-name:var(--font-farsi)] antialiased bg-[#f3f3f3] text-black">
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <FloatingSupport />
        </CartProvider>
      </body>
    </html>
  );
}