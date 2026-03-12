import "next-auth"

declare module "next-auth" {
    interface User {
        role?: string | null
        status?: string | null
        nickname?: string | null
    }

    interface Session {
        user: User & {
            id?: string | null
            role?: string | null
            status?: string | null
            nickname?: string | null
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string | null
        role?: string | null
        status?: string | null
        nickname?: string | null
    }
}
