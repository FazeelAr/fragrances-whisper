import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnAccount = req.nextUrl.pathname.startsWith("/account");

  // Allow admin login page (redirect to /login with next=/admin)
  if (req.nextUrl.pathname === "/admin/login") {
    if (isLoggedIn && req.auth?.user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/login?next=/admin", req.nextUrl));
  }

  if (isOnAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?next=/admin", req.nextUrl));
    }
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl)); // Redirect to home if not admin
    }
  }

  if (isOnAccount && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/admin/login"],
};
