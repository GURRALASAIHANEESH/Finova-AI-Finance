import arcjet, { createMiddleware as createArcjetMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Setup Arcjet middleware
const arcjetMiddleware = arcjet({
  key: process.env.ARCJET_KEY, // Make sure this is set in .env.local
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Combine middlewares: first Arcjet, then Clerk
const middleware = createArcjetMiddleware((request) => {
  if (isProtectedRoute(request)) {
    return clerkMiddleware(request);
  }

  return request; // Continue if not protected
});

// Export final middleware
export default middleware;

// Define routes to match for middleware
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
