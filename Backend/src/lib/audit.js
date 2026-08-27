// src/lib/audit.js
const prisma = require("./prisma");

/**
 * لاگ‌گیری تغییرناپذیر (Append-only). هرگز رکورد audit_log آپدیت یا حذف نمی‌شود -
 * فقط insert. برای هر رویداد مهم مالی/سفارش باید فراخوانی شود.
 */
async function writeAuditLog({
  orderId = null,
  entityType,
  entityId,
  action,
  previousStatus = null,
  newStatus = null,
  actorType,
  actorId = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        orderId,
        entityType,
        entityId,
        action,
        previousStatus,
        newStatus,
        actorType,
        actorId,
        ipAddress,
        userAgent,
        metadata: metadata || undefined,
      },
    });
  } catch (err) {
    // لاگ حسابرسی هرگز نباید کل درخواست را fail کند، اما باید جایی گزارش شود
    console.error("AUDIT LOG WRITE FAILED:", err);
  }
}

module.exports = { writeAuditLog };
