// prisma/seed.js — v0.98
// اجرا: node prisma/seed.js
"use strict";
const { PrismaClient } = require("@prisma/client");
const fs   = require("fs");
const path = require("path");
const prisma = new PrismaClient();

const SEO_PREFIXES = {
  text: "خرید اشتراک",
  code: "خرید اشتراک",
  image: "خرید اکانت",
  video: "خرید اشتراک",
  audio: "خرید اشتراک",
  research: "خرید اشتراک",
  "film-music": "خرید اشتراک",
  gaming: "خرید اکانت",
  "design-graphics": "خرید اشتراک",
  "seo-marketing": "خرید اشتراک",
  "education-utility": "خرید اشتراک",
  telegram: "خرید",
  vps: "خرید سرور مجازی",
  test: "محصول تستی",
};

const DISPLAY_NAMES = {
  chatgpt: "ChatGPT (چت‌جی‌پی‌تی)",
  claude: "Claude (کلود)",
  gemini: "Gemini (جمینی)",
  grok: "Grok (گراک)",
  perplexity: "Perplexity AI (پرپلکسیتی)",
  gamma: "Gamma (گاما)",
  quillbot: "QuillBot (کوئیل‌بات)",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
  windsurf: "Windsurf (Devin)",
  lovable: "Lovable",
  replit: "Replit",
  base44: "Base44",
  "v0-vercel": "v0 by Vercel",
  midjourney: "Midjourney",
  "leonardo-ai": "Leonardo AI",
  canva: "Canva",
  capcut: "CapCut",
  kling: "Kling AI",
  runway: "Runway Gen-3",
  "luma-dream-machine": "Luma Dream Machine",
  suno: "Suno",
  elevenlabs: "ElevenLabs",
  manus: "Manus AI",
  spotify: "Spotify",
  "youtube-premium": "YouTube Premium",
  "apple-music": "Apple Music",
  netflix: "Netflix",
  "apple-tv": "Apple TV+",
  crunchyroll: "Crunchyroll",
  "playstation-plus": "PlayStation Plus",
  "xbox-game-pass": "Xbox Game Pass",
  "discord-nitro": "Discord Nitro",
  figma: "Figma",
  "envato-elements": "Envato Elements",
  freepik: "Freepik",
  "adobe-creative-cloud": "Adobe Creative Cloud",
  semrush: "Semrush",
  ahrefs: "Ahrefs",
  "linkedin-premium": "LinkedIn Premium",
  duolingo: "Duolingo",
  coursera: "Coursera",
  tradingview: "TradingView",
  grammarly: "Grammarly",
  "microsoft-365": "Microsoft 365",
  "google-one": "Google One",
  jetbrains: "JetBrains",
  "telegram-premium": "Telegram Premium",
  "telegram-stars": "Telegram Stars",
  "vps-germany": "سرور مجازی آلمان",
  "vps-usa": "سرور مجازی آمریکا",
  "vps-finland": "سرور مجازی فنلاند",
  "test-zibal-100-toman": "محصول تستی درگاه",
};

const services = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"));
const vpsProducts = [
  { slug: "vps-germany", sku: "VPS-DE-01", category: "vps", sourcingRegion: "Germany",
    variants: [{ name: "۱ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: false },
              { name: "۲ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: true }] },
  { slug: "vps-usa", sku: "VPS-US-01", category: "vps", sourcingRegion: "USA",
    variants: [{ name: "۱ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: false },
              { name: "۲ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: true }] },
  { slug: "vps-finland", sku: "VPS-FI-01", category: "vps", sourcingRegion: "Finland",
    variants: [{ name: "۱ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: false },
              { name: "۲ گیگ رم / ۱ ماهه", durationDays: 30, costUsd: null, isPopular: true }] },
];

async function main() {
  const all = [...services, ...vpsProducts];
  console.log(`Seeding ${all.length} products...`);

  for (const svc of all) {
    const prefix = SEO_PREFIXES[svc.category] || "خرید اشتراک";
    const name = DISPLAY_NAMES[svc.slug] || svc.title || svc.slug;
    const fullSeoTitle = `${prefix} ${name}`;

    const product = await prisma.product.upsert({
      where: { slug: svc.slug },
      update: {
        category: svc.category,
        titlePrefix: prefix,
        title: name,
        metaTitle: `${fullSeoTitle} | بای لیمیت`,
      },
      create: {
        slug: svc.slug,
        sku: svc.sku,
        category: svc.category,
        titlePrefix: prefix,
        title: name,
        metaTitle: `${fullSeoTitle} | بای لیمیت`,
        metaDescription: `${fullSeoTitle} با تحویل سریع، قیمت منصفانه و ضمانت ۱۰۰٪.`,
        mainImage: `/images/products/${svc.slug}.png`,
        requiresVpn: svc.category !== "vps" && svc.category !== "test",
        vpnNote: (svc.category !== "vps" && svc.category !== "test")
          ? "برای استفاده از این سرویس نیازمند تحریم‌شکن با IP ثابت و معتبر هستید."
          : null,
        longDescription: `اشتراک ${fullSeoTitle} با بهترین قیمت، تحویل سریع و پشتیبانی اختصاصی.`,
      },
    });

    for (const v of svc.variants) {
      const priceRial = v.priceRial_override != null ? BigInt(v.priceRial_override) : null;

      await prisma.productVariant.upsert({
        where: { productId_name: { productId: product.id, name: v.name } },
        update: { durationDays: v.durationDays ?? null, costUsd: v.costUsd ?? null },
        create: {
          productId: product.id,
          name: v.name,
          productTitle: fullSeoTitle,
          type: v.isPopular ? "exclusive" : "shared",
          durationDays: v.durationDays ?? null,
          priceRial,
          originalPriceRial: null,
          costUsd: v.costUsd ?? null,
          sourcingRegion: svc.sourcingRegion ?? null,
          deliveryTimeMinutes: 0,
          isPopular: v.isPopular,
          isActive: true,
        },
      });
    }
    process.stdout.write(".");
  }
  console.log(`\n✅ Done. ${all.length} products seeded with clean titlePrefix.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());