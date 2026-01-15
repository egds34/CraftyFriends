"use server";

import { listImages, uploadImage, deleteImage, checkExists } from "@/lib/s3-client";
import { revalidatePath } from "next/cache";

export type ImageFolder = "banner" | "featuredBuilds" | "events" | "postBanner" | "archive";

export async function getImages(folder: ImageFolder) {
    try {
        const images = await listImages(folder);
        return { success: true, data: images };
    } catch (error) {
        console.error("Failed to list images:", error);
        return { success: false, error: "Failed to list images" };
    }
}

export async function uploadImageAction(formData: FormData, folder: ImageFolder, overwrite: boolean = false) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // sanitize
        const key = `${folder}/${filename}`;

        const exists = await checkExists(key);
        if (exists && !overwrite) {
            return { success: false, error: "File already exists", code: "EXISTS", existingKey: key };
        }

        const url = await uploadImage(buffer, key, file.type);
        revalidatePath("/admin/images");
        return { success: true, url };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteImageAction(key: string, archive: boolean = false) {
    try {
        await deleteImage(key, archive);
        revalidatePath("/admin/images");
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false, error: "Delete failed" };
    }
}
