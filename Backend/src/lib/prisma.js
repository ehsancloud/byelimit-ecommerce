// src/lib/prisma.js
const { PrismaClient } = require("@prisma/client");

// در توسعه، nodemon باعث ری‌استارت مکرر می‌شود؛ بدون singleton هر بار
// یک PrismaClient جدید ساخته و کانکشن‌های دیتابیس تمام می‌شوند.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
