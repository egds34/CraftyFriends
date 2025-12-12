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
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                // @ts-ignore
                session.user.role = token.role as string
            }
            return session
        }
    }
} satisfies NextAuthConfig
