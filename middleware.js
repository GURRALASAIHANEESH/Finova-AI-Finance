import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddleware as createArcjetMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Arcjet configuration
const arcjetMiddleware = createArcjetMiddleware({
  key: process.env.ARCJET_KEY || "", // Ensure ARCJET_KEY is set in .env or Vercel
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Clerk route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Middleware function
export async function middleware(req: NextRequest) {
  // Skip middleware for favicon.ico to avoid unnecessary processing
  if (req.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Apply Arcjet middleware
  const arcjetResult = await arcjetMiddleware(req);
  if (arcjetResult) {
    console.log("Arcjet blocked request:", arcjetResult);
    return arcjetResult;
  }

  // Apply Clerk middleware for protected routes
  if (isProtectedRoute(req)) {
    return clerkMiddleware((auth, req) => {
      console.log("Clerk middleware triggered for:", req.nextUrl.pathname);
      auth().protect(); // Ensure authentication for protected routes
      return NextResponse.next();
    })(req);
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
    "/((?!_next|static|.*\\.(?:ico|png|jpg|jpeg|svg|css|js)).*)",
  ],
};
