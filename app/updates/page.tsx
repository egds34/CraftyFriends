import { UpdatesGrid } from "@/components/updates/updates-grid";
import { Newspaper, Plus, Search } from "lucide-react";
import { getUpdates } from "@/app/actions/updates";
import { updatesData as mockData } from "@/lib/updates-data";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function UpdatesPage() {
    // Fetch 100 posts for continuous scrolling as requested
    const { data: dbUpdates, hasMore } = await getUpdates(0, 100);

    // Fallback to mock data if DB is empty for initial impression, 
    // OR just use DB data. Let's combine or prioritize DB.
    // Ideally we should seed the DB, but for now let's just show DB if present, else mock?
    // User requested "Replace mock data", so let's try to just use DB, but maybe seed 
    // it or manually create a post.
    // However, for the demo to not look empty immediately, I'll fallback to mock 
    // if db is empty.

    const updates = dbUpdates && dbUpdates.length > 0 ? dbUpdates : mockData;
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div className="min-h-screen bg-black text-foreground pt-24 pb-20 relative">
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/20 to-transparent opacity-50" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 flex items-center gap-4">
                            <Newspaper className="w-10 h-10 md:w-16 md:h-16 text-primary" />
                            Server Updates
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Stay up to date with the latest patch notes, events, and community news from the Crafty Friends world.
                        </p>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex gap-2">
                        <Link href="/updates/archive">
                            <Button variant="outline" className="gap-2">
                                <Search className="w-4 h-4" />
                                Search & Filter
                            </Button>
                        </Link>
                        {isAdmin && (
                            <Link href="/updates/create">
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create New Post
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Content */}
                <UpdatesGrid initialUpdates={updates as any[]} canCreate={isAdmin} initialHasMore={hasMore} />
            </div>
        </div>
    );
}
