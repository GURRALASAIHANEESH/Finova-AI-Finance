// app/test-db/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({ status: "success", data: users });
  } catch (e) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
