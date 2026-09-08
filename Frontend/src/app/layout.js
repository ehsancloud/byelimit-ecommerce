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
    { path: "./fonts/Modam-Bold.ttf",  weight: "700", style: "normal" },
    { path: "./fonts/Modam-Black.ttf", weight: "900", style: "normal" }, // اصلاح وزن به 900
  ],
  variable: "--font-farsi",
});

export const metadata = {
  metadataBase: new URL("https://byelimit.ir"),
  title: {
    default: "بای لیمیت | فروشگاه اکانت‌های هوش مصنوعی",
    template: "%s | بای لیمیت",
  },
  description:
    "خرید اکانت‌های اختصاصی و قانونی هوش مصنوعی (ChatGPT، Claude، Midjourney و...) با تحویل سریع و ضمانت ۱۰۰٪.",
  other: { google: "notranslate" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "بای لیمیت",
  alternateName: "byelimit",
  url: "https://byelimit.ir",
  logo: "https://byelimit.ir/images/logo.png",
  description:
    "فروشگاه تخصصی اکانت‌های اختصاصی هوش مصنوعی، اشتراک‌های پرمیوم بین‌المللی و سرور مجازی در ایران.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://t.me/byelimit_support",
    availableLanguage: ["Persian"],
  },
  sameAs: ["https://t.me/byelimit_support"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "بای لیمیت",
  url: "https://byelimit.ir",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://byelimit.ir/products?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={fontFarsi.variable} translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="fa" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-[family-name:var(--font-farsi)] antialiased bg-[#f3f3f3] text-black">
        {/* AuthProvider باید بیرونی‌ترین provider باشد تا useAuth در همه صفحات کار کند */}
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 font-[family-name:var(--font-farsi)]">
              <div className="md:hidden mb-2">
                <DollarBox variant="mobile" />
              </div>
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
