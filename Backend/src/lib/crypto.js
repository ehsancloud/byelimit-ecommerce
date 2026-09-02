// Backend/src/lib/crypto.js
// رمزگشایی اختیاری کردنشیال‌های اکانت (AES-256-GCM).
//
// فرمت ذخیره‌سازی در AccountInventory.credentialsEncrypted:
//   v1:<iv-hex>:<tag-hex>:<cipher-hex>
//
// اگر مقدار با این فرمت مطابقت نداشت (مثلاً ادمین متن ساده را در Prisma Studio
// وارد کرده است)، همان مقدار بدون تغییر برگردانده می‌شود تا هر دو حالت کار کنند.

const crypto = require("crypto");

function getKey() {
  const raw = process.env.ACCOUNT_CREDENTIALS_ENCRYPTION_KEY || "";
  if (!raw) return null;

  // کلید hex با طول ۶۴ کاراکتر = ۳۲ بایت
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  // کلید base64 با طول ۳۲ بایت
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {}

  // هر رشته دیگری: مشتق‌سازی با sha256 (فقط برای سازگاری؛ ترجیحاً hex/base64 بدهید)
  return crypto.createHash("sha256").update(raw).digest();
}

/**
 * اگر مقدار با فرمت v1:iv:tag:cipher بود رمزگشایی کن، وگرنه همان مقدار را بده.
 * در صورت هر خطایی (کلید اشتباه و ...) null برنمی‌گردانیم — مقدار خام را می‌دهیم
 * تا پنل کاربری کامل از کار نیفتد؛ لاگ خطا کافی است.
 */
function decryptCredentials(stored) {
  if (typeof stored !== "string" || stored.length === 0) return null;

  if (!stored.startsWith("v1:")) {
    return stored; // متن ساده
  }

  const key = getKey();
  if (!key) {
    console.error("[crypto] ACCOUNT_CREDENTIALS_ENCRYPTION_KEY تنظیم نشده است.");
    return null;
  }

  try {
    const [, ivHex, tagHex, cipherHex] = stored.split(":");
    if (!ivHex || !tagHex || !cipherHex) return null;

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(cipherHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("[crypto] رمزگشایی کردنشیال ناموفق بود:", err.message);
    return null;
  }
}

/** رمزنگاری برای ابزار مدیریتی/seed (استفاده در آینده) */
function encryptCredentials(plain) {
  const key = getKey();
  if (!key) {
    throw new Error("ACCOUNT_CREDENTIALS_ENCRYPTION_KEY تنظیم نشده است.");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

module.exports = { decryptCredentials, encryptCredentials };
