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

    let bannerDir = process.env.BANNER_IMAGE_DIR
    if (!bannerDir) {
        bannerDir = path.join(process.cwd(), 'src/app/assets/bannerImages')
    }

    const filePath = path.join(bannerDir, filename)

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
        console.error(`Error serving banner image ${filename}:`, error)
        return new NextResponse("Image not found", { status: 404 })
    }
}
