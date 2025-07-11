"use server";

import aj from "@/lib/arcjet";
import db from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Enhanced serialization with type checking
const serializeTransaction = (obj) => {
  if (!obj) return obj;
  
  const serialized = { ...obj };
  if (obj.balance && typeof obj.balance === 'object' && 'toNumber' in obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount && typeof obj.amount === 'object' && 'toNumber' in obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

// Database operation with automatic retry for connection issues
async function withDbRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      // Retry only on specific connection/prepared statement errors
      if (attempt === maxRetries || 
         !['26000', '42P05', 'P1010', 'P1017'].includes(error.code)) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
    }
  }
}

export async function getUserAccounts() {
  return withDbRetry(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return accounts.map(serializeTransaction);
  });
}

export async function createAccount(data) {
  return withDbRetry(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: { remaining, resetInSeconds: reset },
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Convert balance to float safely
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    // Transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Check existing accounts
      const existingAccounts = await tx.account.findMany({
        where: { userId: user.id },
      });

      const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

      // If making this default, update others first
      if (shouldBeDefault) {
        await tx.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Create new account
      return await tx.account.create({
        data: {
          ...data,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(result) };
  });
}

export async function getDashboardData() {
  return withDbRetry(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  });
}
