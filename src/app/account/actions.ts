"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    minecraftUsername: z.string().min(1).max(32),
})

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    const parse = schema.safeParse({
        minecraftUsername: formData.get("minecraftUsername"),
    })

    if (!parse.success) {
        return { error: "Invalid username" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                minecraftUsername: parse.data.minecraftUsername,
            },
        })

        revalidatePath("/account")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}

import bcrypt from "bcryptjs"
import { passwordSchema } from "@/lib/password-validation"

export async function setUserPassword(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    const password = formData.get("password") as string

    // Validate password strength
    const validation = passwordSchema.safeParse(password)
    if (!validation.success) {
        return { error: validation.error.issues[0]?.message || "Invalid password" }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        // Check password history (last 5 passwords)
        const passwordHistory = await prisma.passwordHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        for (const oldPassword of passwordHistory) {
            const isReused = await bcrypt.compare(password, oldPassword.hash)
            if (isReused) {
                return { error: "Cannot reuse any of your last 5 passwords" }
            }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        // Add to password history
        await prisma.passwordHistory.create({
            data: {
                userId: session.user.id,
                hash: hashedPassword
            }
        })

        // Keep only last 5 passwords
        const allHistory = await prisma.passwordHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })

        if (allHistory.length > 5) {
            const toDelete = allHistory.slice(5)
            await prisma.passwordHistory.deleteMany({
                where: {
                    id: { in: toDelete.map(h => h.id) }
                }
            })
        }

        revalidatePath("/account")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update password" }
    }
}

export async function toggleTwoFactor(enable: boolean) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })

        if (!user) return { error: "User not found" }

        if (enable && !user.emailVerified) {
            return { error: "Email must be verified first!" }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isTwoFactorEnabled: enable }
        })

        revalidatePath("/account")
        return { success: true }
    } catch (error) {
        return { error: "Something went wrong" }
    }
}

import { generateTwoFactorSecret, verifyTwoFactorToken } from "@/lib/two-factor"
import QRCode from "qrcode"

export async function setupTwoFactorApp() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.email) return { error: "User not found" }

    const { secret, otpauth } = generateTwoFactorSecret(user.email)
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    return { secret, qrCodeUrl }
}

export async function confirmTwoFactorApp(secret: string, code: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    const isValid = verifyTwoFactorToken(code, secret)

    if (!isValid) {
        return { error: "Invalid code" }
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorSecret: secret,
            isTwoFactorEnabled: true // Auto-enable global 2FA
        }
    })

    revalidatePath("/account")
    return { success: true }
}

export async function removeAuthenticatorApp() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: null }
    })

    revalidatePath("/account")
    return { success: true }
}
