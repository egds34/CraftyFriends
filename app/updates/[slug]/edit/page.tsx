import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import { CreatePostEditor } from "@/components/updates/create-post-editor";
import { getUpdateById } from "@/app/actions/updates";

interface EditUpdatePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function EditUpdatePage(props: EditUpdatePageProps) {
    const session = await auth();
    const params = await props.params;

    if (!session?.user || session.user.role !== Role.ADMIN) {
        redirect(`/updates/${params.slug}`);
    }

    const post = await getUpdateById(params.slug);

    if (!post) {
        notFound();
    }

    // Only allow editing database posts (not static ServerUpdate data)
    // Check if it has the database-specific fields
    if (!('createdAt' in post) || !('updatedAt' in post)) {
        // This is static data, redirect to view
        redirect(`/updates/${params.slug}`);
    }

    // We pass the user and the post data to the editor
    return <CreatePostEditor user={session.user} initialData={post} mode="edit" />;
}
