"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

import { signUpSchema } from "@/lib/password-validation"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { getVerificationTokenByToken } from "@/data/verification-token"
import { getUserByEmail } from "@/data/user"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/mail"
import { getPasswordResetTokenByToken } from "@/data/password-reset-token"

// ... imports ...

export async function registerUser(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validation = signUpSchema.safeParse(rawData)

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors }
    }

    const { name, email, password } = validation.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: { email: ["Email already in use"] } }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        // Store initial password in history
        await prisma.passwordHistory.create({
            data: {
                userId: user.id,
                hash: hashedPassword
            }
        })

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return { success: "Confirmation email sent!" }

    } catch (error) {
        console.error("Registration error:", error)
        return { error: { _form: ["Something went wrong. Please try again."] } }
    }
}

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.identifier }
    });

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier // Update email if this was an email change flow (generic safe)
        }
    });

    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: existingToken.identifier,
                token: existingToken.token
            }
        }
    });

    return { success: "Email verified!" };
};

const ResetSchema = z.object({
    email: z.string().email("Invalid email"),
})

import { passwordSchema } from "@/lib/password-validation"

const NewPasswordSchema = z.object({
    password: passwordSchema,
})

export const reset = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: "Reset email sent!" };
}

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>, token?: string | null) => {
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0]?.message || "Invalid password!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check password history (last 5 passwords)
    const passwordHistory = await prisma.passwordHistory.findMany({
        where: { userId: existingUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    for (const oldPassword of passwordHistory) {
        const isReused = await bcrypt.compare(password, oldPassword.hash);
        if (isReused) {
            return { error: "Cannot reuse any of your last 5 passwords" };
        }
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            password: hashedPassword,
            emailVerified: new Date()
        },
    });

    // Add to password history
    await prisma.passwordHistory.create({
        data: {
            userId: existingUser.id,
            hash: hashedPassword
        }
    });

    // Keep only last 5 passwords
    const allHistory = await prisma.passwordHistory.findMany({
        where: { userId: existingUser.id },
        orderBy: { createdAt: 'desc' }
    });

    if (allHistory.length > 5) {
        const toDelete = allHistory.slice(5);
        await prisma.passwordHistory.deleteMany({
            where: {
                id: { in: toDelete.map(h => h.id) }
            }
        });
    }

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Password updated!" };
};

