import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user
    const pathname = nextUrl.pathname

    // 1. If not logged in and trying to access protected routes, redirect to Sign In
    const isProtectedRoute = pathname.startsWith("/share/create") || pathname.startsWith("/admin")
    if (!isLoggedIn && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/signin", nextUrl))
    }

    // 2. If logged in but PENDING, redirect to waiting page
    if (isLoggedIn && user?.status === "PENDING" && pathname !== "/auth/waiting-approval" && pathname !== "/auth/error") {
        return NextResponse.redirect(new URL("/auth/waiting-approval", nextUrl))
    }

    // 3. Profile Completion Check
    const isProfileComplete = !!user?.nickname
    const isAuthPage = pathname.startsWith("/auth")
    const isSetupPage = pathname === "/profile/setup"
    const isApiPage = pathname.startsWith("/api")
    const isNextPage = pathname.startsWith("/_next")

    if (isLoggedIn && user?.status === "ACTIVE" && !isProfileComplete && !isSetupPage && !isAuthPage && pathname !== "/" && !isApiPage && !isNextPage) {
        // Force profile setup for everyone including admins if nickname is missing
        return NextResponse.redirect(new URL("/profile/setup", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
