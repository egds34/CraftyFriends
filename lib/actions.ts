"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function registerUser(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validation = registerSchema.safeParse(rawData)

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

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        // Attempt to sign in immediately after registration
        try {
            await signIn("credentials", {
                redirect: false,
                email,
                password,
            })
        } catch (err) {
            // Ignore redirect error if any, or just let them login manually
        }

        return { success: true }

    } catch (error) {
        console.error("Registration error:", error)
        return { error: { _form: ["Something went wrong. Please try again."] } }
    }
}
