import NextAuth, { DefaultSession } from "next-auth"
import { AdapterUser as NextAuthAdapterUser } from "next-auth/adapters"

export type UserRole = "BASIC" | "ADMIN" | "PREMIUM"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: UserRole
            /** The user's Minecraft username */
            minecraftUsername: string | null
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: UserRole
        minecraftUsername: string | null
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role: UserRole
        minecraftUsername: string | null
        id: string
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role: UserRole
        minecraftUsername: string | null
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role: UserRole
        minecraftUsername: string | null
    }
}
