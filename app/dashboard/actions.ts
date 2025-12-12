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

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}
