// Backend/src/lib/audit.js
const prisma = require("./prisma");

async function writeAuditLog({
  orderId = null,
  entityType,
  entityId,
  action,
  previousStatus = null,
  newStatus = null,
  actorType = "SYSTEM",
  ipAddress = null,
  metadata = null,
}) {
  try {
    const data = {
      entityType: String(entityType),
      entityId: String(entityId),
      action: String(action),
      previousStatus: previousStatus || null,
      newStatus: newStatus || null,
      actorType: String(actorType),
      ipAddress: ipAddress || null,
      metadata: metadata || undefined,
    };

    if (orderId) {
      data.order = { connect: { id: orderId } };
    }

    await prisma.auditLog.create({ data });
  } catch (err) {
    console.warn("[AUDIT LOG WARNING] خطا در ثبت لاگ مانیتورینگ:", err.message);
  }
}

module.exports = { writeAuditLog };