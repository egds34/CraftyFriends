
import { getFileStream } from "@/lib/s3-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const key = path.join("/");

    const file = await getFileStream(key);

    if (!file || !file.Body) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const contentType = file.ContentType || "application/octet-stream";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (file.ContentLength) {
        headers.set("Content-Length", file.ContentLength.toString());
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    try {
        // Load into memory to act as a buffer - safer for Next.js response compatibility
        const bytes = await file.Body.transformToByteArray();
        return new NextResponse(Buffer.from(bytes), { headers });
    } catch (e) {
        console.error("Error streaming file:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
