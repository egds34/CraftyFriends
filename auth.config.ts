import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    session: { strategy: "jwt" },
    providers: [],
    pages: {
        signIn: "/auth/signin"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.role = user.role
                // @ts-ignore
                token.minecraftUsername = user.minecraftUsername
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                // @ts-ignore
                session.user.role = token.role as string
                // @ts-ignore
                session.user.minecraftUsername = token.minecraftUsername as string | null
            }
            return session
        }
    }
} satisfies NextAuthConfig
