"use client";

import { useState } from "react";
import { updatePost, createPost } from "@/app/actions/updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateDetailView } from "@/components/updates/update-detail-view";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Post } from "@prisma/client";

interface CreatePostEditorProps {
    user: any;
    initialData?: Post;
    mode?: "create" | "edit";
}

export function CreatePostEditor({ user, initialData, mode = "create" }: CreatePostEditorProps) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formState, setFormState] = useState({
        title: initialData?.title || "New Update",
        excerpt: initialData?.excerpt || "This is a short summary of the update...",
        content: initialData?.content || "<p>Start typing your content here...</p>",
        image: initialData?.image || "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=2000",
        category: initialData?.category || "announcement",
        featured: initialData?.featured || false,
        readTime: initialData?.readTime || "1 min"
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

        let result;
        if (mode === "edit" && initialData?.id) {
            result = await updatePost(initialData.id, formData);
        } else {
            result = await createPost(null, formData);
        }

        if (result.success) {
            if (mode === "edit") {
                router.push(`/updates/${initialData?.id}`);
            } else {
                router.push("/updates");
            }
            router.refresh();
        } else {
            setError(result.message || `Failed to ${mode} post`);
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
        author: "Crafty Friends Team",
        readTime: formState.readTime,
        createdAt: initialData?.createdAt || new Date(),
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={mode === "edit" && initialData?.id ? `/updates/${initialData.id}` : "/updates"}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-tight">
                                {mode === "edit" ? "Edit Update" : "Create New Update"}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {mode === "edit" ? "Make changes to an existing post." : "Share news, events, and announcements with the community."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={pending} className="min-w-[140px]">
                            {pending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === "edit" ? "Updating..." : "Publishing..."}
                                </>
                            ) : (
                                mode === "edit" ? "Save Changes" : "Publish Live"
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* Editor Column */}
                    <div className="space-y-8 order-2 xl:order-1">
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                Post Details
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formState.title}
                                        onChange={handleChange}
                                        placeholder="Enter a catchy title..."
                                        className="text-lg font-bold"
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                            placeholder="e.g. 5 min"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt / Summary</Label>
                                    <textarea
                                        id="excerpt"
                                        name="excerpt"
                                        value={formState.excerpt}
                                        onChange={handleChange}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Brief summary shown on the main feed..."
                                    />
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
                                    <Label htmlFor="featured" className="font-normal cursor-pointer">Feature this post (Pin to top)</Label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                Media & Content
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image">Cover Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="image"
                                            name="image"
                                            value={formState.image}
                                            onChange={handleChange}
                                            className="font-mono text-xs"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Recommended size: 1920x1080 or 16:9 aspect ratio.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Main Content (HTML)</Label>
                                    <div className="relative">
                                        <textarea
                                            id="content"
                                            name="content"
                                            value={formState.content}
                                            onChange={handleChange}
                                            className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-4 py-4 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 leading-relaxed"
                                            placeholder="<p>Write your update content here...</p>"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Supports standard HTML tags like {`<h1>`}, {`<p>`}, {`<ul>`}, {`<img>`}. Use Tailwind classes for styling if needed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
                                Error: {error}
                            </div>
                        )}
                    </div>

                    {/* Preview Column */}
                    <div className="order-1 xl:order-2">
                        <div className="sticky top-24 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-muted-foreground">Live Preview</h3>
                                <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70 bg-muted px-2 py-1 rounded">
                                    Auto-Updating
                                </div>
                            </div>

                            <div className="border border-border rounded-3xl overflow-hidden shadow-2xl bg-background max-h-[85vh] overflow-y-auto custom-scrollbar relative">
                                {/* Scale down the preview slightly to fit better if needed, or just let it be responsive */}
                                <div className="origin-top transform scale-[0.85] sm:scale-90 lg:scale-100 h-full w-full">
                                    <UpdateDetailView update={previewUpdate} isPreview={true} />
                                </div>
                                {/* Block clicks on preview */}
                                <div className="absolute inset-0 z-50 bg-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
