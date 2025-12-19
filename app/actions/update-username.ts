'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateMinecraftUsername(username: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    if (!username || username.trim().length === 0) {
        throw new Error("Username is required")
    }

    // Limit length to typical Minecraft username limits (3-16 chars)
    // but just basic check here
    if (username.length < 3 || username.length > 16) {
        throw new Error("Invalid username length (3-16 characters)")
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { minecraftUsername: username }
    })

    revalidatePath("/")
    // We don't necessarily need to redirect, just revalidating is enough 
    // for the client component to see the update eventually, 
    // but a hard refresh might be needed for the session update.
    return { success: true }
}
