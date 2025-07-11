"use server";

import { seedTransactions } from "@/lib/seed/seedTransactions";

export async function POST(req) {
  const result = await seedTransactions();
  return Response.json(result);
}
