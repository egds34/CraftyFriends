import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // Debug log to see what middleware intercepts
    console.log(`Middleware Intercepted: ${req.nextUrl.pathname}`);

    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    if (isOnDashboard) {
        if (isLoggedIn) return
        return Response.redirect(new URL("/api/auth/signin", req.nextUrl))
    } else if (isLoggedIn) {
        // If user is logged in and trying to access auth pages (login/signup), redirect to dashboard?
        // Maintaining simple logic for now.
    }
    return
})

// Optionally config to match specific paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
