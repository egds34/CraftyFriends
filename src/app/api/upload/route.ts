
import { NextRequest, NextResponse } from "next/server"
import { uploadToB2 } from "@/lib/b2"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    // 1. Check Authentication (Admin only)
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const folder = (formData.get("folder") as string) || "uploads"

        if (!file) {
            return new NextResponse("No file provided", { status: 400 })
        }

        // 2. Validate File Type (optional but recommended)
        if (!file.type.startsWith("image/")) {
            return new NextResponse("Invalid file type. Only images allowed.", { status: 400 })
        }

        // 3. Upload to B2
        // We need to convert File to Buffer or Stream for the SDK if needed, 
        // but the SDK supports Blob/File in newer environment (node 18+ fetch mostly compliant)
        // However, converting to Buffer is safest for Node environment.
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const url = await uploadToB2(buffer, file.name, file.type)

        return NextResponse.json({ url })

    } catch (error) {
        console.error("Upload error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
