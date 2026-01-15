"use client";

import { useState } from "react";
import { ImageFolder } from "@/app/actions/upload-image";
import { ImageManager } from "@/components/admin/image-manager";
import { JellyTabs } from "@/components/ui/jelly-tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminImagesPage() {
    const [activeTab, setActiveTab] = useState<string>("banner");

    const tabs = [
        { id: "banner", label: "Hero Banners" },
        { id: "featuredBuilds", label: "Featured Builds" },
        { id: "events", label: "Events" },
        { id: "postBanner", label: "Update Posts" },
        { id: "archive", label: "Archive" },
    ];

    const getFolderInfo = (tab: string) => {
        switch (tab) {
            case "banner":
                return {
                    title: "Hero Banners",
                    description: "Images displayed in the main hero carousel on the landing page. Deleting items here moves them to archive."
                };
            case "featuredBuilds":
                return {
                    title: "Featured Builds",
                    description: "Images showcasing community builds on the landing page."
                };
            case "events":
                return {
                    title: "Event Images",
                    description: "Cover images for event guides and listings."
                };
            case "postBanner":
                return {
                    title: "Post Banners",
                    description: "Header images for news updates and blog posts."
                };
            case "archive":
                return {
                    title: "Archived Images",
                    description: "Previously used banner images. Restore them by re-uploading to the banner folder."
                };
            default:
                return { title: "Images", description: "" };
        }
    };

    const info = getFolderInfo(activeTab);

    return (
        <div className="container mx-auto px-4 pt-24 py-8 space-y-8 min-h-screen max-w-7xl">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Image Management</h1>
                        <p className="text-muted-foreground">Upload and manage site content images.</p>
                    </div>
                </div>

                <div className="flex justify-center md:justify-start">
                    <JellyTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[500px]">
                <ImageManager
                    key={activeTab} // Force re-mount on tab change to reset state
                    folder={activeTab as ImageFolder}
                    title={info.title}
                    description={info.description}
                />
            </div>
        </div>
    );
}
