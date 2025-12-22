
import { NextRequest, NextResponse } from "next/server"
import { s3Client, B_BUCKET_NAME } from "@/lib/b2"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ key: string[] }> }
) {
    const { key: keyParts } = await params
    const key = keyParts.join("/")

    if (!B_BUCKET_NAME) {
        return new NextResponse("Server configuration error", { status: 500 })
    }

    try {
        const command = new GetObjectCommand({
            Bucket: B_BUCKET_NAME,
            Key: key,
        })

        const response = await s3Client.send(command)

        if (!response.Body) {
            return new NextResponse("Not found", { status: 404 })
        }

        // Convert the Node.js Readable stream to a Web ReadableStream
        // S3 SDK v3 returns different types depending on environment (Node/Browser).
        // In Node, Body is usually minimal-compatible Stream.
        const stream = response.Body as Readable // Cast for Node env typing

        // Web Standard ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk))
                stream.on("end", () => controller.close())
                stream.on("error", (err) => controller.error(err))
            },
        })

        return new NextResponse(webStream as any, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable", // Cache aggressively
                "Content-Length": response.ContentLength?.toString() || "",
                "Last-Modified": response.LastModified?.toUTCString() || "",
            },
        })

    } catch (error: any) {
        if (error.name === "NoSuchKey") {
            return new NextResponse("Image not found", { status: 404 })
        }
        console.error(`Error proxying B2 file ${key}:`, error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}
