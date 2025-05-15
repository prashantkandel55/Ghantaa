import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For admin routes, check if admin is authenticated
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Check for admin authentication
    // Since we can't use cookies in middleware directly, we'll redirect to login
    // and let the page component handle the authentication check

    // We can't use getAdminSession() here because it's client-side
    // Instead, we'll do a basic check for the presence of the admin_session cookie
    const hasAdminSession = request.cookies.has("admin_session")

    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
}
