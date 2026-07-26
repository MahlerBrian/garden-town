export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
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
