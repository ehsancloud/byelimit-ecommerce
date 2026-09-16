"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, Send, X, Clock } from "lucide-react";

import { usePathname } from "next/navigation";

const SUPPORT_PHONE_DISPLAY = "290 0100 0918";
const SUPPORT_PHONE_TEL = "+989180100290";
const SUPPORT_TELEGRAM_URL = "tg://resolve?domain=byelimit_support";
const WORKING_HOURS_LABEL = "پاسخگویی و تحویل: هرروز ساعت ۱۰ تا ۲۲";

// مدیریت یکپارچه موتور صوتی در سطح تب/ویندو
let sharedAudioCtx = null;
let sharedAudio = null;
let isAudioUnlocked = false;
let isPendingChime = false;

function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  return sharedAudioCtx;
}

function getAudioElement() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio("/sounds/chime.wav");
    sharedAudio.preload = "auto";
    sharedAudio.volume = 0.6;
  }
  return sharedAudio;
}

// سنتز صدای زنگوله بسیار شفاف و ملایم (دو نت سل 5 و دو 6) بدون وابستگی به شبکه
function playSynthesizedBell(ctx) {
  try {
    const now = ctx.currentTime;

    // نت اول: سل 5 (784 هرتز) با افت طبیعی
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.38);

    // نت دوم: دو 6 (1046.5 هرتز) شفاف و زنگوله ای
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, now + 0.07);
    gain2.gain.setValueAtTime(0, now + 0.07);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.48);

    return true;
  } catch {
    return false;
  }
}

// تابع پخش صدای زنگوله با فال بک های چند لایه
function triggerChime() {
  if (typeof window === "undefined") return;

  // لایه ۱: تلاش برای پخش با Web Audio API (صفر تاخیر و بالاترین کیفیت)
  const ctx = getAudioCtx();
  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        playSynthesizedBell(ctx);
      }).catch(() => {
        isPendingChime = true;
      });
      return;
    } else if (ctx.state === "running") {
      playSynthesizedBell(ctx);
      return;
    }
  }

  // لایه ۲: تلاش برای پخش با تگ صوتی HTML5
  try {
    const audio = getAudioElement();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.6;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          isPendingChime = true;
        });
      }
      return;
    }
  } catch {
    isPendingChime = true;
  }
}

// فعال سازی دسترسی صوتی با اولین تعامل کاربر (لمس یا کلیک)
function unlockAudioEngine() {
  if (typeof window === "undefined") return;

  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {}
  }

  const audio = getAudioElement();
  if (audio && !isAudioUnlocked) {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      isAudioUnlocked = true;
    }).catch(() => {});
  }

  // اگر پخش صدا در صف مانده بود، بلافاصله پس از فعال سازی اجرا شود
  if (isPendingChime) {
    isPendingChime = false;
    triggerChime();
  }
}

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const containerRef = useRef(null);
  const pathname = usePathname();

  // بستن پاپ آپ راه های ارتباطی هنگام کلیک بیرون از آن
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // رجیستر کردن لیسنر تعامل کاربر جهت دور زدن محدودیت Autoplay مرورگرها
  useEffect(() => {
    const events = ["pointerdown", "touchstart", "touchend", "click", "keydown"];
    const handleInteraction = () => {
      unlockAudioEngine();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleInteraction);
      });
    };
  }, []);

  // با ورود به هر صفحه یا ریلود شدن، بابل مخفی و دقیقا بعد از ۱۰ ثانیه ظاهر شود و صدا پخش کند
  useEffect(() => {
    setShowPrompt(false);
    isPendingChime = false;

    const timer = setTimeout(() => {
      setShowPrompt(true);
      triggerChime();
    }, 10000);

    return () => {
      clearTimeout(timer);
      isPendingChime = false;
    };
  }, [pathname]);

  // باز یا بسته کردن پاپ آپ ارتباطی
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setShowPrompt(false);
    isPendingChime = false;
  };

  // بستن بابل راهنمایی
  const handleClosePrompt = (e) => {
    e.stopPropagation();
    setShowPrompt(false);
    isPendingChime = false;
  };

  // فقط در صفحه تک محصول بالاتر باشد تا روی نوار ثبت سفارش نیفتد، در صفحه فروشگاه و دسته بندی ها هم راستا با فیلتر (bottom-6) است
  const isProductDetail = Boolean(
    pathname &&
    pathname.startsWith("/products/") &&
    !pathname.startsWith("/products/category") &&
    pathname !== "/products" &&
    pathname !== "/products/"
  );
  const bottomClass = isProductDetail ? "bottom-28 sm:bottom-6" : "bottom-6";

  return (
    <div
      ref={containerRef}
      className={`fixed ${bottomClass} right-6 z-30 font-[family-name:var(--font-farsi)] dir-rtl`}
    >
      {/* بابل متن کمکی بعد از ۱۰ ثانیه */}
      <AnimatePresence>
        {showPrompt && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-2.5 right-[68px] sm:right-[72px] whitespace-nowrap bg-[#fff9c4] border-[2.5px] border-black px-3.5 py-2 rounded-2xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => {
              setIsOpen(true);
              setShowPrompt(false);
              isPendingChime = false;
            }}
          >
            <span className="font-black text-xs text-black group-hover:text-blue-700 transition-colors">
              نیاز به راهنمایی دارید؟
            </span>
            <button
              onClick={handleClosePrompt}
              className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
              aria-label="بستن پیام"
            >
              <X className="w-3 h-3 text-black stroke-[3]" />
            </button>
            {/* فلش جهت نما به سمت دکمه پشتیبانی */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-black pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            // ✅ FIX: right-0 به جای left-0 تا پاپ آپ از سمت راست باز بشه و از صفحه بیرون نرود.
            // باگ قبلی: left-0 باعث می شد پاپ آپ به سمت راست گسترش پیدا کند و از صفحه خارج شود.
            className="absolute bottom-[72px] right-0 w-64 bg-white border-[3px] border-black rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="bg-[#12e2a3] border-b-[2.5px] border-black p-3 flex items-center justify-between">
              <span className="font-black text-sm text-black">راه های ارتباطی</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 bg-white border-[1.5px] border-black rounded-md hover:bg-gray-100 cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2">
              <a
                href={SUPPORT_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-[#f8f9fa] hover:bg-[#e0f2fe] border-[2px] border-black rounded-xl font-black text-xs transition-colors"
              >
                <div className="w-8 h-8 bg-white border-[1.5px] border-black rounded-lg flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-blue-500 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block">پشتیبانی تلگرام</span>
                  <span className="block text-[10px] font-bold text-gray-500">
                    سریع ترین راه ارتباطی
                  </span>
                </div>
              </a>

              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="flex items-center gap-2.5 p-2.5 bg-[#f8f9fa] hover:bg-[#fff9c4] border-[2px] border-black rounded-xl font-black text-xs transition-colors"
              >
                <div className="w-8 h-8 bg-white border-[1.5px] border-black rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block">تماس تلفنی</span>
                  <span className="block text-[10px] font-bold text-gray-500 dir-ltr text-right">
                    {SUPPORT_PHONE_DISPLAY}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-2 px-1 pt-1 text-[10px] font-bold text-gray-600">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{WORKING_HOURS_LABEL}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className="w-14 h-14 bg-[#12e2a3] border-[3px] border-black rounded-full flex items-center justify-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer relative active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all"
        aria-label="ارتباط با پشتیبانی"
        aria-expanded={isOpen}
      >
        {!isOpen && (
          <div className="absolute inset-0 bg-[#12e2a3] rounded-full animate-ping opacity-50 z-0" />
        )}
        {isOpen ? (
          <X className="w-6 h-6 text-black stroke-[2.5] relative z-10" />
        ) : (
          <MessageCircle className="w-7 h-7 text-black stroke-[2.5] relative z-10" />
        )}
      </button>
    </div>
  );
}
