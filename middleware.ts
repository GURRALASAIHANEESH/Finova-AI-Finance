import { authMiddleware } from "@clerk/nextjs";
import { arcjet, detectBot, shield } from "@arcjet/next";

// Define Arcjet middleware
const arcjetMiddleware = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Initialize Clerk middleware
const clerk = authMiddleware();

export default arcjetMiddleware(clerk);

// Match all routes except static/_next etc., include favicon explicitly
export const config = {
  matcher: [
    "/",
    "/dashboard(.*)",
    "/account(.*)",
    "/transaction(.*)",
    "/favicon.ico",
    "/((?!_next|static|.*\\..*).*)",
  ],
};
