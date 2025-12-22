import { UpdatesGrid } from "@/components/updates/updates-grid";
import { Newspaper, Plus, Search } from "lucide-react";
import { getUpdates } from "@/app/actions/updates";
import { updatesData as mockData } from "@/lib/updates-data";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function UpdatesPage() {
    const { data: dbUpdates, hasMore } = await getUpdates(0, 20);
    const mockUpdates: any[] = mockData.map(d => ({ ...d, createdAt: new Date(d.date), updatedAt: new Date(d.date), published: true, featured: false, authorId: "mock", readTime: d.readTime }));
    const updates = dbUpdates && dbUpdates.length > 0 ? dbUpdates : mockUpdates;
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-20 relative transition-colors duration-500">
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent opacity-50 dark:from-indigo-900/20" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 mb-16 relative">
                    <h1 className="text-4xl font-extrabold font-heading tracking-tight lg:text-5xl">
                        Server Updates
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stay up to date with the latest patch notes, events, and community news from the Crafty Friends world.
                    </p>

                    {/* Admin Actions - Floating/Centered below intro */}
                    <div className="flex justify-center gap-3 pt-4">

                        {isAdmin && (
                            <Link href="/updates/create">
                                <Button className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20">
                                    <Plus className="w-4 h-4" />
                                    New Post
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
