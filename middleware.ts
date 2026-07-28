import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/gardens/:path*",
    "/dashboard/:path*",
    "/plots/:path*",
    "/members/:path*",
    "/schedule/:path*",
    "/plants/:path*",
    "/announcements/:path*",
    "/discussions/:path*",
    "/admin/:path*",
  ],
};
