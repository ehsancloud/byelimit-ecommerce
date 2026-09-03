import localFont from "next/font/local";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import FloatingSupport from "../components/layout/FloatingSupport";
import Breadcrumb from "../components/common/Breadcrumb";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import DollarBox from "../components/layout/header/DollarBox";
import "./globals.css";

const fontFarsi = localFont({
  src: [
    { path: "./fonts/Modam-Bold.ttf",  weight: "400", style: "normal" },
    { path: "./fonts/Modam-Black.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-farsi",
});

export const metadata = {
  metadataBase: new URL("https://byelimit.ir"),
  title: "بای لیمیت | فروشگاه اکانت‌های هوش مصنوعی",
  description:
    "خرید اکانت‌های اختصاصی و قانونی هوش مصنوعی (ChatGPT، Claude، Midjourney و...) با تحویل سریع و ضمانت ۱۰۰٪.",
  other: { google: "notranslate" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={fontFarsi.variable} translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="fa" />
      </head>
      <body className="font-[family-name:var(--font-farsi)] antialiased bg-[#f3f3f3] text-black">
        {/* AuthProvider باید بیرونی‌ترین provider باشد تا useAuth در همه صفحات کار کند */}
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 font-[family-name:var(--font-farsi)]">
              <Breadcrumb />
            </div>
            {children}
            <Footer />
            <FloatingSupport />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
