import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize() { return null }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.status = (user as any).status
                token.nickname = (user as any).nickname
            }
            if (trigger === "update" && session?.user) {
                // Return updated token with current session data, merging carefully
                return {
                    ...token,
                    nickname: session.user.nickname ?? token.nickname,
                    status: session.user.status ?? token.status,
                    role: session.user.role ?? token.role,
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = (token.id as string) || (token.sub as string)
                    ; (session.user as any).role = token.role;
                ; (session.user as any).status = token.status;
                ; (session.user as any).nickname = token.nickname;
            }
            return session
        }
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    }
} satisfies NextAuthConfig
