import { Newspaper, Search, Filter } from "lucide-react";
import { getUpdates } from "@/app/actions/updates";
import { UpdatesFeed } from "@/components/updates/updates-feed"; // Re-using Feed (Option C) or creating new List (Option B)? User asked for B. I'll create a List view.
import { ArchiveFilters } from "@/components/updates/archive-filters";
import { ArchiveList } from "@/components/updates/archive-list";

export const dynamic = 'force-dynamic';

interface ArchivePageProps {
    searchParams: {
        q?: string;
        category?: string;
    }
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
    const { data: updates } = await getUpdates(0, 100, {
        search: searchParams.q,
        category: searchParams.category
    });

    return (
        <div className="min-h-screen bg-black text-foreground pt-24 pb-20 relative">
            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold font-heading tracking-tight mb-4 flex items-center gap-4">
                        <Search className="w-10 h-10 text-primary" />
                        Update Archive
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Search through the history of Crafty Friends.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-muted/10 border border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-24">
                            <div className="flex items-center gap-2 mb-4 font-bold text-lg">
                                <Filter className="w-5 h-5 text-primary" />
                                Filters
                            </div>
                            <ArchiveFilters />
                        </div>
                    </div>

                    {/* Main Content List */}
                    <div className="lg:col-span-3">
                        <ArchiveList updates={updates || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
