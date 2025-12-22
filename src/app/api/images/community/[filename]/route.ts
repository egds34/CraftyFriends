import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { lookup } from "mime-types"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params

    // Security: Prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return new NextResponse("Invalid filename", { status: 400 })
    }

    let communityDir = process.env.COMMUNITY_IMAGE_DIR
    if (!communityDir) {
        // Fallback for dev/testing if not set
        communityDir = path.join(process.cwd(), 'src/app/assets/communityImages')
    }

    const filePath = path.join(communityDir, filename)

    try {
        // Check if file exists
        await fs.access(filePath)

        // Read file
        const fileBuffer = await fs.readFile(filePath)

        // Determine mime type
        const contentType = lookup(filename) || "application/octet-stream"

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, immutable",
            },
        })
    } catch (error) {
        // console.error(`Error serving community image ${filename}:`, error)
        return new NextResponse("Image not found", { status: 404 })
    }
}
