import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createMiddleware as createArcjetMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Arcjet configuration
const arcjetMiddleware = createArcjetMiddleware({
  key: process.env.ARCJET_KEY || "", // Ensure this is defined in your .env
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Clerk route matcher
const isProtectedRoute = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Final middleware function
export async function middleware(req: NextRequest) {
  // First pass through Arcjet
  const arcjetResult = await arcjetMiddleware(req);
  if (arcjetResult) return arcjetResult;

  // Then pass through Clerk for protected routes
  if (isProtectedRoute(req)) {
    return clerkMiddleware(req);
  }

  return NextResponse.next();
}

// Routes to match
export const config = {
  matcher: [
    "/", 
    "/dashboard(.*)", 
    "/account(.*)", 
    "/transaction(.*)", 
    "/((?!_next|static|.*\\..*).*)", 
    "/favicon.ico"
  ],
};
