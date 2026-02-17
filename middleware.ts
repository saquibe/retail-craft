import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  console.log("Middleware - path:", path, "token:", !!token);

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/admin-login" ||
    path === "/user-login" ||
    path.startsWith("/reset-password");

  // Allow access to public paths
  if (isPublicPath) {
    // If user is already logged in and tries to access login page,
    // we still let them access it - they can login again if needed
    return NextResponse.next();
  }

  // For protected paths (admin/*, user/*), check if token exists
  // if (!token) {
  //   console.log("Middleware - no token, redirecting to home");
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // Token exists, allow access
  // Let the client-side AuthContext handle role-based redirects
  console.log("Middleware - token exists, allowing access to:", path);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
