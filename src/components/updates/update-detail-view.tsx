import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, User, Clock, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UpdateDetailViewProps {
    update: {
        id?: string;
        title: string;
        excerpt?: string;
        content: string;
        image: string;
        category: string;
        author: string;
        readTime: string;
        createdAt: Date | string; // Date or string depending on source
    };
    isPreview?: boolean; // If true, disable links or modify behavior
}

export function UpdateDetailView({ update, isPreview = false }: UpdateDetailViewProps) {
    return (
        <article className="min-h-screen bg-background text-foreground pt-24 pb-20 relative transition-colors duration-500">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
                {/* Back Button - Hide in preview */}
                {!isPreview && (
                    <Link href="/updates" className="inline-flex mb-8">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Updates
                        </Button>
                    </Link>
                )}

                {/* Hero Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm py-1 px-4 border-transparent rounded-full font-bold">
                            {update.category.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(update.createdAt || new Date()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold font-heading tracking-tight mb-8 text-foreground leading-tight">
                        {update.title || "Untitled Post"}
                    </h1>

                    <div className="flex items-center justify-between border-y border-border py-8">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{update.author || "Unknown Author"}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Author</p>
                                </div>
                            </div>
                            <div className="h-10 w-[1px] bg-border hidden sm:block" />
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                                    <Clock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{update.readTime || "1 min"}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Read Time</p>
                                </div>
                            </div>
                        </div>

                        {!isPreview && (
                            <Button variant="outline" size="lg" className="gap-2 rounded-full border-border hover:bg-muted font-bold">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share Article</span>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-16 border border-border shadow-2xl bg-muted/20">
                    {update.image ? (
                        <Image
                            src={update.image}
                            alt={update.title || "Cover Image"}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={isPreview}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-heading italic">No Cover Image</div>
                    )}
                </div>

                <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-black prose-p:text-foreground/80 prose-a:text-primary prose-img:rounded-3xl prose-strong:text-foreground">
                    <div dangerouslySetInnerHTML={{ __html: update.content || "<p>Start writing...</p>" }} />
                </div>
            </div>
        </article>
    );
}
