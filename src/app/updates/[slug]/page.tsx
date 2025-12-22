import { notFound } from "next/navigation";
import { getUpdateById } from "@/app/actions/updates";
import { UpdateDetailView } from "@/components/updates/update-detail-view";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface UpdatePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function UpdatePage(props: UpdatePageProps) {
    const params = await props.params;
    const update = await getUpdateById(params.slug);

    if (!update) {
        notFound();
    }

    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {isAdmin && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Link href={`/updates/${update.id}/edit`}>
                        <Button size="lg" className="rounded-full shadow-2xl font-bold gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Post
                        </Button>
                    </Link>
                </div>
            )}

            <UpdateDetailView update={update} />
        </>
    );
}
