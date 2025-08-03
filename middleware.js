import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const hostname = request.headers.get("host") || "";

  // ✅ Step 1: Subdomain Redirect (e.g., redirect abc.example.com to example.com)
  // const baseDomain = "noshib786.com"; // Change this to your main domain
  // const validSubdomains = ["www", "admin", "masteragent"];

  // // Extract subdomain only if not running locally (localhost:3000)
  // if (!hostname.includes("localhost")) {
  //   const parts = hostname.split(".");
  //   if (parts.length > 2) {
  //     const subdomain = parts[0].toLowerCase();
  //     if (!validSubdomains.includes(subdomain)) {
  //       return NextResponse.redirect(`https://${baseDomain}`);
  //     }
  //   }
  // }
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
