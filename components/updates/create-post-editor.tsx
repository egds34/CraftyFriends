"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateDetailView } from "@/components/updates/update-detail-view";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreatePostEditor({ user }: { user: any }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formState, setFormState] = useState({
        title: "New Update",
        excerpt: "This is a short summary of the update...",
        content: "<p>Start typing your content here...</p>",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=2000",
        category: "announcement",
        featured: false,
        readTime: "1 min"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, featured: e.target.checked }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);

        const formData = new FormData();
        Object.entries(formState).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const result = await createPost(null, formData);

        if (result.success) {
            router.push("/updates");
            router.refresh();
        } else {
            setError(result.message || "Failed to create post");
            setPending(false);
        }
    }

    // construct preview object
    const previewUpdate = {
        title: formState.title,
        excerpt: formState.excerpt,
        content: formState.content,
        image: formState.image,
        category: formState.category,
        author: user?.name || "Admin",
        readTime: formState.readTime,
        createdAt: new Date(),
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden flex-col md:flex-row">
            {/* Left Sidebar: Editor */}
            <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl relative z-20 shrink-0">
                <div className="p-4 border-b border-white/10 flex items-center gap-4">
                    <Link href="/updates">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h2 className="font-heading font-bold text-lg">Create Update</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formState.title}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formState.category}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white/5 border-white/10 px-3 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="announcement">Announcement</option>
                                    <option value="patch-notes">Patch Notes</option>
                                    <option value="event">Event</option>
                                    <option value="community">Community</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="readTime">Read Time</Label>
                                <Input
                                    id="readTime"
                                    name="readTime"
                                    value={formState.readTime}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Cover Image</Label>
                            <Input
                                id="image"
                                name="image"
                                value={formState.image}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                value={formState.excerpt}
                                onChange={handleChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-white/5 border-white/10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content (HTML Support)</Label>
                            <textarea
                                id="content"
                                name="content"
                                value={formState.content}
                                onChange={handleChange}
                                className="flex min-h-[300px] w-full rounded-md border border-input bg-white/5 border-white/10 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            <p className="text-xs text-muted-foreground">Type raw HTML here. It will render in the preview.</p>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="featured"
                                name="featured"
                                checked={formState.featured}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="featured">Feature this post</Label>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-xl">
                    <Button onClick={handleSubmit} disabled={pending} className="w-full" size="lg">
                        {pending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish Live"
                        )}
                    </Button>
                </div>
            </div>

            {/* Right Pane: Live Preview */}
            <div className="flex-1 bg-black overflow-y-auto relative h-[50vh] md:h-full">
                {/* Overlay indicating it's a preview */}
                <div className="absolute top-4 right-4 z-50 pointer-events-none">
                    <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        Live Preview
                    </span>
                </div>

                {/* Wrapper to reset page constraints if needed, or just let UpdateDetailView handle it. 
                    UpdateDetailView has min-h-screen which is perfect for scrolling within this div (if div is overflow-y-auto).
                */}
                <UpdateDetailView update={previewUpdate} isPreview={true} />
            </div>
        </div>
    );
}
