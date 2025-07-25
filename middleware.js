import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const adminCookie = request.cookies.get("admin-auth");
  const masterAgentCookie = request.cookies.get("masterAgent-auth");

  // Admin Auth
  const isAdminProtected = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  // MasterAgent Auth
  const isMasterAgentProtected = pathname.startsWith("/masterAgent");
  const isMasterAgentLogin = pathname === "/masterAgent/login";

  // Not authenticated - redirect to login
  if (
    isAdminProtected &&
    !isAdminLogin &&
    (!adminCookie || adminCookie.value !== "true")
  ) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (
    isMasterAgentProtected &&
    !isMasterAgentLogin &&
    (!masterAgentCookie || masterAgentCookie.value !== "true")
  ) {
    url.pathname = "/masterAgent/login";
    return NextResponse.redirect(url);
  }

  // Already authenticated - prevent access to login pages
  if (isAdminLogin && adminCookie?.value === "true") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isMasterAgentLogin && masterAgentCookie?.value === "true") {
    url.pathname = "/masterAgent";
    return NextResponse.redirect(url);
  }

  // Allow request
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/masterAgent/:path*"], // ✅ Apply to both admin and masterAgent
};
