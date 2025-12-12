import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

// Schema for credentials validation
const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        Google,
        GitHub,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const parsed = signInSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data
                const user = await prisma.user.findUnique({ where: { email } })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(password, user.password)
                if (!isValid) return null

                return user
            }
        })
    ],
})
