// middleware.js
// This file acts as a gatekeeper for routes, checking authentication before allowing access.

import { NextResponse } from "next/server";

// Define the paths that require authentication.
const protectedRoutes = ["/admin"]; // All paths under /admin (except login) will be protected.
const authRoutes = ["/admin/login"]; // Paths that are specifically for authentication (e.g., login, register)

// Middleware function that runs for every incoming request.
export async function middleware(request) {
  // Get the 'admin-auth' cookie from the request headers.
  const authCookie = request.cookies.get("admin-auth");
  const isAuthenticated = authCookie && authCookie.value === "true";
  const url = request.nextUrl.clone(); // Clone the URL to modify it if needed

  // Check if the current path starts with any of the protected routes.
  const isProtectedRoutePath = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );
  // Check if the current path is specifically one of the authentication-related routes.
  const isAuthRoutePath = authRoutes.includes(url.pathname);

  // Scenario 1: User is not authenticated.
  if (!isAuthenticated) {
    // If they are trying to access a protected route (e.g., /admin, /admin/dashboard)
    // AND they are NOT already on an authentication route (like /admin/login)
    if (isProtectedRoutePath && !isAuthRoutePath) {
      // Redirect them to the login page.
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  // Scenario 2: User IS authenticated.
  else {
    // isAuthenticated is true
    // If they are trying to access an authentication route (like /admin/login)
    if (isAuthRoutePath) {
      // Redirect them to the admin dashboard (e.g., /admin).
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // If none of the above conditions trigger a redirect, allow the request to proceed.
  return NextResponse.next();
}

// Define the matcher to specify which paths the middleware should apply to.
// This ensures the middleware only runs for relevant routes, optimizing performance.
export const config = {
  matcher: ["/admin/:path*"], // Apply to all paths starting with /admin
};
