// Backend/src/services/telegramNotifier.js
const fs = require("fs");
const path = require("path");

function getEnv(key) {
  let val = process.env[key];
  if (!val) {
    const candidatePaths = [
      path.join(__dirname, "../../.env"),
      "/etc/byelimit/.env",
      path.join(__dirname, "../../.env.production"),
    ];

    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, "utf8");
          const lines = content.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
            const idx = trimmed.indexOf("=");
            const k = trimmed.substring(0, idx).trim();
            if (k === key) {
              val = trimmed.substring(idx + 1).trim();
              process.env[key] = val; // cache in process.env
              break;
            }
          }
        }
      } catch (e) {}
      if (val) break;
    }
  }

  return (val || "").trim().replace(/^["']|["']$/g, "");
}

function getTelegramConfigStatus() {
  const proxyUrl = getEnv("TELEGRAM_PROXY_URL");
  const botToken = getEnv("TELEGRAM_BOT_TOKEN");
  const chatId = getEnv("TELEGRAM_SUPPORT_CHAT_ID");
  const topicId = getEnv("TELEGRAM_SUPPORT_TOPIC_ID");

  return {
    configured: Boolean(proxyUrl && botToken && chatId),
    hasProxyUrl: Boolean(proxyUrl),
    hasBotToken: Boolean(botToken),
    hasChatId: Boolean(chatId),
    chatIdPreview: chatId ? chatId.substring(0, 5) + "..." : null,
    topicId: topicId || null,
  };
}

function rialToToman(rial) {
  if (rial === null || rial === undefined) return 0;
  const bigRial = typeof rial === "bigint" ? rial : BigInt(Math.trunc(Number(rial)));
  return Number(bigRial / 10n);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends a new order notification to the Telegram support group.
 * Features automatic fallback for environment variables and a 3-attempt retry mechanism.
 *
 * @param {Object} order - Full order object including items, products, variants, and user.
 * @param {Object} verifyResult - Payment verification result.
 */
async function notifyNewOrder(order, verifyResult) {
  const proxyUrl = getEnv("TELEGRAM_PROXY_URL");
  const botToken = getEnv("TELEGRAM_BOT_TOKEN");
  let chatId = getEnv("TELEGRAM_SUPPORT_CHAT_ID");
  const topicId = getEnv("TELEGRAM_SUPPORT_TOPIC_ID");

  if (!proxyUrl || !botToken || !chatId) {
    console.warn("⚠️ [Telegram Notifier] Missing environment variables (TELEGRAM_PROXY_URL, TELEGRAM_BOT_TOKEN, or TELEGRAM_SUPPORT_CHAT_ID). Skipping notification.");
    return { success: false, reason: "missing_env" };
  }

  // Telegram supergroups/channels start with -100...
  // If the user provided 1004360326001 without the minus, automatically prepend '-'
  if (!chatId.startsWith("-") && chatId.startsWith("100")) {
    chatId = `-${chatId}`;
  }

  try {
    const itemsText = (order?.items || [])
      .map((item, index) => {
        const title = escapeHtml(item.product?.title || item.product?.titleEn || item.productTitleSnapshot || "محصول");
        const variant = escapeHtml(item.variant?.name || item.variantNameSnapshot || "");
        return `${index + 1}. ${title} ${variant ? `(${variant})` : ""}`;
      })
      .join("\n");

    const totalToman = (order?.totalRial ? rialToToman(order.totalRial) : 0).toLocaleString("fa-IR");
    const refNumber = escapeHtml(verifyResult?.refNumber || "نامشخص");
    const fullName = escapeHtml(order?.fullName || order?.user?.fullName || "بدون نام");
    const userId = escapeHtml(order?.user?.id || order?.userId || "مهمان");
    const mobile = escapeHtml(order?.mobile || "نامشخص");
    const orderNumber = escapeHtml(order?.orderNumber || "نامشخص");

    const text = `<b>🛒 سفارش جدید #${orderNumber}</b>\n\n👤 نام: ${fullName}\n📱 شماره: ${mobile}\n🆔 آیدی: <code>${userId}</code>\n\n📦 محصول:\n${itemsText}\n\n💰 مبلغ کل: ${totalToman} تومان\n🔢 کد رهگیری: <code>${refNumber}</code>`;

    const payload = {
      token: botToken,
      chat_id: chatId,
      parse_mode: "HTML",
      text: text,
      reply_markup: {
        inline_keyboard: [
          [{ text: "مشاهده در پنل ادمین", url: `https://byelimit.ir:5555/order/${order?.id || ""}` }],
        ],
      },
    };

    if (topicId && !isNaN(Number(topicId))) {
      payload.message_thread_id = Number(topicId);
    }

    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const response = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseText = await response.text();

        let responseData = null;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = null;
        }

        if (response.ok && (!responseData || responseData.ok !== false)) {
          console.log(`✅ [Telegram Notifier] Order notification sent successfully (attempt ${attempt}). Message ID:`, responseData?.result?.message_id);
          return { success: true, messageId: responseData?.result?.message_id };
        } else {
          console.error(`⚠️ [Telegram Notifier] Attempt ${attempt} returned error from Proxy:`, responseText);
          lastError = new Error(responseText);
        }
      } catch (attemptErr) {
        console.error(`⚠️ [Telegram Notifier] Attempt ${attempt} exception:`, attemptErr.message || attemptErr);
        lastError = attemptErr;
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    return { success: false, error: lastError?.message };
  } catch (err) {
    console.error("❌ [Telegram Notifier] Unexpected exception:", err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  notifyNewOrder,
  getTelegramConfigStatus,
  getEnv,
};
