import "next-auth"

declare module "next-auth" {
    interface User {
        role?: string
        status?: string
        nickname?: string
    }

    interface Session {
        user: User & {
            id?: string
            role?: string
            status?: string
            nickname?: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: string
        status?: string
        nickname?: string
    }
}
