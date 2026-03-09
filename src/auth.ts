import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) return null

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) return null

                return user
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user }) {
            // Block sign in if status is PENDING or SUSPENDED
            // We allow ADMIN to sign in regardless of status during setup if needed, 
            // but usually ADMIN is ACTIVE anyway.
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email! }
            })

            if (dbUser?.status === "PENDING") {
                // Redirect user to waiting page
                throw new Error("WAITING_APPROVAL")
            }

            if (dbUser?.status === "SUSPENDED") {
                throw new Error("ACCOUNT_SUSPENDED")
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.status = user.status
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string | undefined;
                session.user.status = token.status as string | undefined;
            }
            return session
        }
    },
    pages: {
        error: "/auth/error", // Optional: handle specific errors like WAITING_APPROVAL
    }
})
