"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    excerpt: z.string().min(1, "Excerpt is required"),
    content: z.string().min(1, "Content is required"),
    image: z.string().url("Valid image URL is required"),
    category: z.string().min(1, "Category is required"),
    featured: z.boolean().default(false),
    readTime: z.string().default("1 min"),
});

export async function createPost(prevState: any, formData: FormData) {
    const session = await auth();

    // 1. Authorization Check
    if (!session?.user || session.user.role !== Role.ADMIN) {
        return { success: false, message: "Unauthorized: Admins only" };
    }

    // 2. Parse Data
    const rawData = {
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        image: formData.get("image"),
        category: formData.get("category"),
        featured: formData.get("featured") === "on",
        readTime: formData.get("readTime") || "1 min",
    };

    const validated = createPostSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: "Validation failed", errors: validated.error.flatten().fieldErrors };
    }

    const { title, excerpt, content, image, category, featured, readTime } = validated.data;

    try {
        // 3. Create Post
        await prisma.post.create({
            data: {
                title,
                excerpt,
                content,
                image,
                category,
                featured,
                readTime,
                author: "Crafty Friends Team",
                authorId: session.user.id,
                published: true,
            }
        });

        revalidatePath("/updates");
        return { success: true, message: "Post created successfully!" };
    } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, message: "Database error" };
    }
}


export async function updatePost(id: string, formData: FormData) {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
        return { success: false, message: "Unauthorized" };
    }

    const rawData = {
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        image: formData.get("image"),
        category: formData.get("category"),
        featured: formData.get("featured") === "true",
        readTime: formData.get("readTime") || "1 min",
    };

    const validated = createPostSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: "Validation failed", errors: validated.error.flatten().fieldErrors };
    }

    try {
        await prisma.post.update({
            where: { id },
            data: {
                ...validated.data,
                // Do not update author
            }
        });

        revalidatePath("/updates");
        revalidatePath(`/updates/${id}`);
        return { success: true, message: "Post updated successfully!" };
    } catch (error) {
        console.error("Failed to update post:", error);
        return { success: false, message: "Database error" };
    }
}

export async function getUpdates(
    offset: number = 0,
    limit: number = 100,
    filters?: {
        search?: string;
        category?: string;
    }
) {
    try {
        const whereClause: any = { published: true };

        if (filters?.search) {
            whereClause.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { excerpt: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters?.category && filters.category !== 'all') {
            whereClause.category = filters.category;
        }

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' },
            ],
            skip: offset,
            take: limit,
        });

        // Check if there are more
        const total = await prisma.post.count({ where: { published: true } });
        const hasMore = offset + limit < total;

        return { success: true, data: posts, hasMore };
    } catch (error) {
        console.error("Failed to fetch updates:", error);
        return { success: false, data: [], hasMore: false };
    }
}

export async function getUpdateById(id: string) {
    try {
        const post = await prisma.post.findUnique({
            where: { id }
        });
        return post;
    } catch (error) {
        return null;
    }
}
