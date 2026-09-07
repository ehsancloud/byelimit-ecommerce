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

function cleanEnv(val) {
  return (val || "").trim().replace(/^["']|["']$/g, "");
}

async function notifyNewOrder(order, verifyResult) {
  const proxyUrl = cleanEnv(process.env.TELEGRAM_PROXY_URL);
  const botToken = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  let chatId = cleanEnv(process.env.TELEGRAM_SUPPORT_CHAT_ID);
  const topicId = cleanEnv(process.env.TELEGRAM_SUPPORT_TOPIC_ID);

  if (!proxyUrl || !botToken || !chatId) {
    console.warn("⚠️ [Telegram Notifier] Missing environment variables. Skipping notification.");
    return;
  }

  if (!chatId.startsWith("-") && chatId.startsWith("100")) {
    chatId = `-${chatId}`;
  }

  try {
    const itemsText = (order?.items || [])
      .map((item, index) => {
        const title = escapeHtml(item.product?.titleEn || item.productTitleSnapshot || "محصول");
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

    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    // First request with manual redirect to prevent POST converting to GET on 302
    let response = await fetch(proxyUrl, { ...fetchOptions, redirect: "manual" });

    // Handle Google Apps Script 302 redirect manually to preserve POST
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (location) {
        response = await fetch(location, { ...fetchOptions, redirect: "follow" });
      }
    }

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = null;
    }

    if (!response.ok || (responseData && responseData.ok === false)) {
      console.error("❌ [Telegram Notifier] Error from Telegram API/Proxy:", responseText);
    } else {
      console.log("✅ [Telegram Notifier] Order notification sent successfully.");
    }
  } catch (err) {
    console.error("❌ [Telegram Notifier] Exception occurred while sending notification:", err.message || err);
  }
}

module.exports = { notifyNewOrder };
