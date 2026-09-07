const { rialToToman } = require("../lib/pricing");

const TELEGRAM_PROXY_URL = process.env.TELEGRAM_PROXY_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_SUPPORT_CHAT_ID = process.env.TELEGRAM_SUPPORT_CHAT_ID;
const TELEGRAM_SUPPORT_TOPIC_ID = process.env.TELEGRAM_SUPPORT_TOPIC_ID;

/**
 * Sends a new order notification to the Telegram support group.
 * This function is designed to be non-blocking and fails gracefully.
 *
 * @param {Object} order - Full order object including items, products, variants, and user.
 * @param {Object} verifyResult - Payment verification result.
 */
async function notifyNewOrder(order, verifyResult) {
  if (!TELEGRAM_PROXY_URL || !TELEGRAM_BOT_TOKEN || !TELEGRAM_SUPPORT_CHAT_ID) {
    console.warn("Telegram notifier environment variables are missing. Skipping notification.");
    return;
  }

  try {
    const itemsText = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.product?.titleEn || item.productTitleSnapshot} (${
            item.variant?.name || item.variantNameSnapshot
          })`
      )
      .join("\n");

    const totalToman = rialToToman(order.totalRial).toLocaleString("fa-IR");
    const refNumber = verifyResult?.refNumber || "نامشخص";
    const fullName = order.fullName || order.user?.fullName || "بدون نام";
    const userId = order.user?.id || "مهمان";

    const text = `<b>🛒 سفارش جدید #${order.orderNumber}</b>\n\n👤 نام: ${fullName}\n📱 شماره: ${order.mobile}\n🆔 آیدی: <code>${userId}</code>\n\n📦 محصول:\n${itemsText}\n💰 مبلغ کل: ${totalToman} تومان\n🔢 کد رهگیری: <code>${refNumber}</code>`;

    const payload = {
      token: TELEGRAM_BOT_TOKEN,
      chat_id: TELEGRAM_SUPPORT_CHAT_ID,
      text: text,
      reply_markup: {
        inline_keyboard: [
          [{ text: "مشاهده در پنل ادمین", url: `https://byelimit.ir:5555/order/${order.id}` }],
        ],
      },
    };

    if (TELEGRAM_SUPPORT_TOPIC_ID) {
      payload.message_thread_id = Number(TELEGRAM_SUPPORT_TOPIC_ID);
    }

    // Fire and forget, don't throw on error
    await fetch(TELEGRAM_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

  } catch (err) {
    console.error("Failed to send telegram notification:", err);
  }
}

module.exports = {
  notifyNewOrder,
};
