import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { CredentialsSignin } from "next-auth"

class TwoFactorRequiredError extends CredentialsSignin {
    constructor(public twoFactorType: "APP" | "EMAIL") {
        super(`2FA_REQUIRED_${twoFactorType}`)
        this.code = `2FA_REQUIRED_${twoFactorType}`
    }
}

// Schema for credentials validation
const signInSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    token: z.string().optional(),
    code: z.string().optional(),
})

import { getVerificationTokenByToken } from "@/data/verification-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mail";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Google({ allowDangerousEmailAccountLinking: true }),
        GitHub({ allowDangerousEmailAccountLinking: true }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                token: { label: "Token", type: "text" },
                code: { label: "2FA Code", type: "text" }
            },
            async authorize(credentials) {
                const parsed = signInSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password, token, code } = parsed.data

                // Token-based Login (Verification)
                if (token) {
                    console.log("[AUTH] Token login attempt");
                    const verificationToken = await getVerificationTokenByToken(token);
                    if (!verificationToken) return null;

                    const hasExpired = new Date(verificationToken.expires) < new Date();
                    if (hasExpired) return null;

                    const existingUser = await prisma.user.findUnique({
                        where: { email: verificationToken.identifier }
                    });

                    if (!existingUser) return null;

                    const updatedUser = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            emailVerified: new Date(),
                            email: verificationToken.identifier
                        }
                    });

                    await prisma.verificationToken.delete({
                        where: {
                            identifier_token: {
                                identifier: verificationToken.identifier,
                                token: verificationToken.token
                            }
                        }
                    });

                    return updatedUser;
                }

                // Password-based Login
                if (!email || !password) return null;

                console.log("[AUTH] Authorizing credentials for:", email);

                try {
                    const user = await prisma.user.findUnique({ where: { email } })

                    if (!user || !user.password) {
                        console.log("[AUTH] User not found or no password");
                        return null
                    }

                    const isValid = await bcrypt.compare(password, user.password)

                    if (!isValid) {
                        console.log("[AUTH] Invalid password");
                        return null
                    }

                    if (user.isTwoFactorEnabled && user.email) {
                        if (code) {
                            // 1. Check TOTP if user has it
                            if (user.twoFactorSecret) {
                                const { verifyTwoFactorToken } = await import("@/lib/two-factor");
                                const isValidTotp = verifyTwoFactorToken(code, user.twoFactorSecret);
                                if (isValidTotp) {
                                    return user;
                                }
                            }

                            // 2. Check Email Token verification
                            const twoFactorToken = await getTwoFactorTokenByEmail(user.email);
                            // If we have a token (user requested email code manually or it was sent auto), check it
                            if (twoFactorToken) {
                                if (twoFactorToken.token === code) {
                                    const hasExpired = new Date(twoFactorToken.expires) < new Date();
                                    if (!hasExpired) {
                                        await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });
                                        // Handle confirmation record
                                        const existingConfirmation = await getTwoFactorConfirmationByUserId(user.id);
                                        if (existingConfirmation) {
                                            await prisma.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
                                        }
                                        await prisma.twoFactorConfirmation.create({ data: { userId: user.id } });

                                        return user;
                                    }
                                }
                            }

                            // If we reached here, neither code worked
                            console.log("[AUTH] 2FA code invalid");
                            return null;

                        } else {
                            // No code provided. 
                            console.log("[AUTH] 2FA required");
                            // If user has TOTP, we just ask for code (don't email).
                            // If user ONLY has Email 2FA, we send email.
                            if (user.twoFactorSecret) {
                                console.log("[AUTH] Throwing APP 2FA Error");
                                throw new TwoFactorRequiredError("APP");
                            } else {
                                const twoFactorToken = await generateTwoFactorToken(user.email);
                                await sendTwoFactorTokenEmail(
                                    twoFactorToken.email,
                                    twoFactorToken.token
                                );
                                console.log("[AUTH] Throwing EMAIL 2FA Error");
                                throw new TwoFactorRequiredError("EMAIL");
                            }
                        }
                    }

                    console.log("[AUTH] Login successful. EmailVerified:", user.emailVerified);
                    return user
                } catch (error) {
                    console.error("[AUTH] Authorize error:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth without verification check (Github/Google verify emails)
            if (account?.provider !== "credentials") return true;

            console.log("[AUTH] SignIn Callback. EmailVerified:", (user as any).emailVerified);

            // For Credentials, check if email is verified
            // @ts-ignore
            if (!user.emailVerified) {
                console.log("[AUTH] AccessDenied: Email not verified for user:", user.email);
                return false;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.role = user.role
                // @ts-ignore
                token.minecraftUsername = user.minecraftUsername
            }

            // Refresh logic: if no user object (subsequent calls), fetch from DB
            if (!user && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { minecraftUsername: true, role: true }
                })
                if (dbUser) {
                    token.minecraftUsername = dbUser.minecraftUsername
                    // @ts-ignore
                    token.role = dbUser.role
                }
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
})
