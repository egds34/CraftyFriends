
import { S3Client, ListObjectsV2Command, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the S3 client for Backblaze B2
export const s3Client = new S3Client({
    endpoint: (process.env.B2_ENDPOINT_URL?.startsWith("http") ? process.env.B2_ENDPOINT_URL : `https://${process.env.B2_ENDPOINT_URL}`) || "", // e.g., https://s3.us-west-004.backblazeb2.com
    region: process.env.B2_REGION || "us-west-004",
    credentials: {
        accessKeyId: process.env.B2_KEY_ID || "",
        secretAccessKey: process.env.B2_APPLICATION_KEY || ""
    }
})

export const B_BUCKET_NAME = process.env.B2_BUCKET_NAME || ""

export interface B2Image {
    key: string;
    url: string;
    lastModified: Date;
    size: number;
}

/**
 * Uploads a file to B2 and returns the local proxy URL.
 */
export async function uploadToB2(
    file: File | Buffer,
    fileName: string,
    contentType: string,
    folder: string = "uploads"
): Promise<string> {
    if (!B_BUCKET_NAME) throw new Error("B2_BUCKET_NAME not set");

    const key = `${folder}/${fileName}`; // Simplify key structure to avoid duplication

    try {
        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: B_BUCKET_NAME,
                Key: key,
                Body: file,
                ContentType: contentType,
            },
        });

        await parallelUploads3.done();

        // Return the proxy URL
        return `/api/images/proxy/${key}`;
    } catch (error) {
        console.error("Error uploading to Backblaze B2:", error);
        throw new Error("Failed to upload file");
    }
}

/**
 * Lists images in a specific folder (prefix).
 */
export async function listB2Images(prefix: string): Promise<B2Image[]> {
    if (!B_BUCKET_NAME) throw new Error("B2_BUCKET_NAME not set");

    // Ensure prefix ends with / if not empty, to treat as folder
    const safePrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;

    try {
        const command = new ListObjectsV2Command({
            Bucket: B_BUCKET_NAME,
            Prefix: safePrefix,
            // Delimiter: '/' // Uncomment if we want strictly one level, but recursive is usually fine for this app
        });

        const response = await s3Client.send(command);

        if (!response.Contents) return [];

        return response.Contents
            .filter(item => item.Key && item.Size && item.Size > 0 && !item.Key.endsWith('/')) // Filter out folders
            .map(item => ({
                key: item.Key!,
                url: `/api/images/proxy/${item.Key!}`,
                lastModified: item.LastModified || new Date(),
                size: item.Size || 0
            }))
            .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()); // Newest first

    } catch (error) {
        console.error("Error listing B2 images:", error);
        return [];
    }
}

/**
 * Moves an image (Copy + Delete). Used for archiving/restoring.
 */
export async function moveB2Image(sourceKey: string, destKey: string): Promise<string> {
    if (!B_BUCKET_NAME) throw new Error("B2_BUCKET_NAME not set");

    try {
        // 1. Copy
        await s3Client.send(new CopyObjectCommand({
            Bucket: B_BUCKET_NAME,
            CopySource: `${B_BUCKET_NAME}/${sourceKey}`, // Required format: bucket/key
            Key: destKey
        }));

        // 2. Delete Original
        await s3Client.send(new DeleteObjectCommand({
            Bucket: B_BUCKET_NAME,
            Key: sourceKey
        }));

        return `/api/images/proxy/${destKey}`;
    } catch (error) {
        console.error(`Error moving B2 image from ${sourceKey} to ${destKey}:`, error);
        throw error;
    }
}


/**
 * Deletes an image.
 */
export async function deleteB2Image(key: string): Promise<void> {
    if (!B_BUCKET_NAME) throw new Error("B2_BUCKET_NAME not set");

    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: B_BUCKET_NAME,
            Key: key
        }));
    } catch (error) {
        console.error("Error deleting B2 image:", error);
        throw error;
    }
}

/**
 * Checks if an image exists in the bucket.
 */
export async function checkB2FileExists(key: string): Promise<boolean> {
    if (!B_BUCKET_NAME) throw new Error("B2_BUCKET_NAME not set");

    try {
        await s3Client.send(new HeadObjectCommand({
            Bucket: B_BUCKET_NAME,
            Key: key,
        }));
        // If HeadObject succeeds, it exists
        return true;
    } catch (error: any) {
        if (error.name === "NotFound" || error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        console.warn(`Error checking file existence for ${key}:`, error);
        return false;
    }
}
