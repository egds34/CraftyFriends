import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const CLOUDFLARE_URL = process.env.NEXT_PUBLIC_IMAGE_HOST_URL || ""; // Optional: if using a CDN
const ENDPOINT = process.env.B2_ENDPOINT || "";
const REGION = process.env.B2_REGION || "us-east-005";
const ACCESS_KEY = process.env.B2_KEY_ID || "";
const SECRET_KEY = process.env.B2_APP_KEY || "";
const BUCKET = process.env.B2_BUCKET_NAME || "";

const s3Client = new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

export type B2Image = {
    key: string;
    url: string;
    lastModified?: Date;
    size?: number;
};

// Helper to get full URL
// B2 native URL format: https://f005.backblazeb2.com/file/<bucket_name>/<key>
// Or if using Cloudflare/Custom Domain: https://<domain>/<key>
export function getImageUrl(key: string) {
    if (CLOUDFLARE_URL) {
        return `${CLOUDFLARE_URL}/${key}`;
    }


    // Use local proxy API to serve images from private bucket
    return `/api/images/${key}`;
}

export async function listImages(folder: string): Promise<B2Image[]> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: folder.endsWith("/") ? folder : `${folder}/`,
        });

        const response = await s3Client.send(command);

        if (!response.Contents) return [];

        return response.Contents
            .filter(item => item.Key && !item.Key.endsWith("/") && !item.Key.endsWith(".bzEmpty")) // Exclude folders and placeholders
            .map(item => ({
                key: item.Key!,
                url: getImageUrl(item.Key!),
                lastModified: item.LastModified,
                size: item.Size
            }))
            .sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));

    } catch (error) {
        console.error("Error listing images:", error);
        return [];
    }
}

export async function uploadImage(fileBuffer: Buffer, key: string, contentType: string) {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            // ACL: "public-read" // B2 S3 API might handle bucket-level policies instead
        });

        await s3Client.send(command);
        return getImageUrl(key);
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

export async function deleteImage(key: string, archive: boolean = false) {
    try {
        if (archive) {
            // Copy to archive folder
            const filename = key.split('/').pop();
            const archiveKey = `archive/${Date.now()}-${filename}`;

            await s3Client.send(new CopyObjectCommand({
                Bucket: BUCKET,
                CopySource: `${BUCKET}/${key}`, // B2 requires bucket/key for CopySource
                Key: archiveKey
            }));
        }

        // Delete original
        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        return true;
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}

export async function checkExists(key: string): Promise<boolean> {
    try {
        await s3Client.send(new HeadObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));
        return true;
    } catch (error: any) {
        if (error.name === "NotFound") return false;
        // Assume false or rethrow?
        return false;
    }
}

export async function getFileStream(key: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key
        });
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        // console.error("Error getting file stream:", error);
        return null;
    }
}
