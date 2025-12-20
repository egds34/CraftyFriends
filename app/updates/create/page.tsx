import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { CreatePostEditor } from "@/components/updates/create-post-editor";

export default async function CreateUpdatePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
        redirect("/updates");
    }

    // We pass the user to the editor to auto-populate the author field in preview
    return <CreatePostEditor user={session.user} />;
}
