import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"
import bcrypt from "bcryptjs"
import Credentials from "next-auth/providers/credentials"
const providers = [
    Credentials({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            console.log("Authorize attempt for:", credentials?.email)
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string }
            })

            if (!user || !user.password) {
                return null
            }

            const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user.password
            )

            if (!isPasswordValid) {
                return null
            }

            return user
        }
    })
]

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user }) {
            console.log("SignIn callback for:", user.email)
            if (!user.email) return false

            const dbUser = await prisma.user.findUnique({
                where: { email: user.email }
            })

            if (!dbUser) return true

            if (dbUser.status === "PENDING") {
                throw new Error("WAITING_APPROVAL")
            }

            if (dbUser.status === "SUSPENDED") {
                throw new Error("ACCOUNT_SUSPENDED")
            }

            return true
        },
    }
})
