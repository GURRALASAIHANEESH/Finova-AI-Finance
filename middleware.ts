import { authMiddleware } from "@clerk/nextjs";
import { arcjet, detectBot, shield } from "@arcjet/next";
import { NextResponse } from "next/server";

// Combine Arcjet middleware
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

// Export the final middleware handler
export default arcjetMiddleware(authMiddleware());

// Define what routes need middleware (Clerk + Arcjet will apply to these)
export const config = {
  matcher: [
    "/",
    "/dashboard(.*)",
    "/account(.*)",
    "/transaction(.*)",
    "/((?!_next|static|.*\\..*).*)",
  ],
};
