"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateMinecraftUsernameSchema = z.object({
    username: z.string().min(1, "Username is required").max(16, "Username must be 16 characters or less")
})

export async function updateMinecraftUsername(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const rawData = {
        username: formData.get("username")
    }

    const validatedFields = updateMinecraftUsernameSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: "Invalid username" }
    }

    const { username } = validatedFields.data

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { minecraftUsername: username }
        })

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to update username:", error)
        return { error: "Failed to update username. Please try again." }
    }
}
