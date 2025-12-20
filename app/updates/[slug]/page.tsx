import { notFound } from "next/navigation";
import { getUpdateById } from "@/app/actions/updates";
import { UpdateDetailView } from "@/components/updates/update-detail-view";

interface UpdatePageProps {
    params: {
        slug: string;
    };
}

export default async function UpdatePage({ params }: UpdatePageProps) {
    const update = await getUpdateById(params.slug);

    if (!update) {
        notFound();
    }

    return (
        <>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>
            <UpdateDetailView update={update} />
        </>
    );
}
