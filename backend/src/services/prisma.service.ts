/**
 * services/prisma.service.ts — Prisma Client Singleton (Prisma 6)
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
