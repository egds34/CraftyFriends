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
        <article className="min-h-screen bg-black text-foreground pt-24 pb-20 relative">
            {/* Background elements - Only show if NOT in preview mode to avoid stacking weirdness? 
                Or show them but maybe contained? 
                If preview is split screen, we might want to contain this. 
                Let's assume this view renders the FULL PAGE content. 
            */}

            <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
                {/* Back Button - Hide in preview */}
                {!isPreview && (
                    <Link href="/updates" className="inline-flex mb-8">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Updates
                        </Button>
                    </Link>
                )}

                {/* Hero Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 text-sm py-1 px-3 border-transparent">
                            {update.category.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(update.createdAt || new Date()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight mb-8 text-white leading-tight">
                        {update.title || "Untitled Post"}
                    </h1>

                    <div className="flex items-center justify-between border-y border-white/10 py-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center border border-white/10">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{update.author || "Unknown Author"}</p>
                                    <p className="text-xs text-muted-foreground">Author</p>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                            <div className="flex items-center gap-3 hidden sm:flex">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-white">{update.readTime || "1 min"}</p>
                                    <p className="text-xs text-muted-foreground">Read Time</p>
                                </div>
                            </div>
                        </div>

                        {!isPreview && (
                            <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-muted/10">
                    {update.image ? (
                        <Image
                            src={update.image}
                            alt={update.title || "Cover Image"}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={isPreview} // Avoid optimization issues with transient URLs if any
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No Cover Image</div>
                    )}
                </div>

                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:text-muted-foreground/90 prose-a:text-primary prose-img:rounded-xl">
                    <div dangerouslySetInnerHTML={{ __html: update.content || "<p>Start writing...</p>" }} />
                </div>
            </div>
        </article>
    );
}
