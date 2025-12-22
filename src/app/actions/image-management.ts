
"use server";

import { auth } from "@/auth";
import { uploadToB2, listB2Images, moveB2Image, deleteB2Image, checkB2FileExists, B2Image } from "@/lib/b2";
import { revalidatePath } from "next/cache";

export type ImageActionState = {
    success: boolean;
    message?: string;
    data?: any;
};

// Ensure user is admin
async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

/**
 * Get images from a folder (e.g., 'banner' or 'featured')
 */
export async function getB2Images(folder: string): Promise<{ success: boolean, images: B2Image[], error?: string }> {
    try {
        const images = await listB2Images(folder);
        return { success: true, images };
    } catch (error) {
        console.error("Failed to fetch images:", error);
        return { success: false, images: [], error: "Failed to fetch images" };
    }
}

/**
 * Check for duplicate files in B2 before upload.
 * Returns a list of filenames that already exist.
 */
export async function checkImageConflicts(folder: string, filenames: string[]): Promise<string[]> {
    try {
        await checkAdmin();
        const conflicts: string[] = [];

        // This could be parallelized, but for checking conflicts we want to be safe.
        // Parallelizing is fine for read-only checks.
        await Promise.all(filenames.map(async (filename) => {
            const key = `${folder}/${filename}`;
            const exists = await checkB2FileExists(key);
            if (exists) {
                conflicts.push(filename);
            }
        }));

        return conflicts;
    } catch (error) {
        console.error("Conflict check error:", error);
        return [];
    }
}

/**
 * Upload multiple images to a specific folder
 */
export async function uploadB2Images(folder: string, formData: FormData): Promise<ImageActionState> {
    try {
        await checkAdmin();

        const files = formData.getAll("files") as File[];
        if (!files || files.length === 0) {
            return { success: false, message: "No files provided" };
        }

        const uploadPromises = files.map(file =>
            file.arrayBuffer().then(buffer =>
                uploadToB2(Buffer.from(buffer), file.name, file.type, folder)
            )
        );

        const urls = await Promise.all(uploadPromises);

        revalidatePath("/admin/cms");
        revalidatePath("/"); // Update landing page potentially

        return { success: true, message: "Images uploaded successfully", data: urls };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, message: "Failed to upload images" };
    }
}

/**
 * Archive an image: Move from `{folder}/{filename}` to `archive/{folder}/{filename}`
 */
export async function archiveB2Image(key: string): Promise<ImageActionState> {
    try {
        await checkAdmin();

        // Key is like "banner/image.jpg"
        // Dest should be "archive/banner/image.jpg"
        const destKey = `archive/${key}`;

        await moveB2Image(key, destKey);

        revalidatePath("/admin/cms");
        return { success: true, message: "Image archived" };
    } catch (error) {
        console.error("Archive error:", error);
        return { success: false, message: "Failed to archive image" };
    }
}

/**
 * Restore an image: Move from `archive/{folder}/{filename}` to `{folder}/{filename}`
 */
export async function restoreB2Image(key: string): Promise<ImageActionState> {
    try {
        await checkAdmin();

        // Key is like "archive/banner/image.jpg"
        // Dest should be "banner/image.jpg"
        if (!key.startsWith("archive/")) {
            return { success: false, message: "Invalid specific archive key" };
        }

        const destKey = key.replace("archive/", "");

        await moveB2Image(key, destKey);

        revalidatePath("/admin/cms");
        return { success: true, message: "Image restored" };
    } catch (error) {
        console.error("Restore error:", error);
        return { success: false, message: "Failed to restore image" };
    }
}

/**
 * Delete an image permanently
 */
export async function deleteB2ImageAction(key: string): Promise<ImageActionState> {
    try {
        await checkAdmin();
        await deleteB2Image(key);
        revalidatePath("/admin/cms");
        return { success: true, message: "Image deleted permanently" };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, message: "Failed to delete image" };
    }
}
