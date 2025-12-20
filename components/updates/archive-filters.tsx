"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
// Actually I haven't checked for Select component. 
// I'll use standard select for safety or check list_dir first.
// Checking list_dir earlier: NO Select component found in components/ui.
// I will use standard HTML select styled beautifully.

export function ArchiveFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for immediate UI feedback
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');

    // Debounce Search update
    const updateSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) params.set('q', term);
        else params.delete('q');
        router.push(`/updates/archive?${params.toString()}`);
    }, [searchParams, router]);

    // Manual debounce useEffect
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (searchParams.get('q') || '')) {
                updateSearch(search);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, updateSearch, searchParams]);

    const handleCategoryChange = (newCat: string) => {
        setCategory(newCat);
        const params = new URLSearchParams(searchParams.toString());
        if (newCat && newCat !== 'all') params.set('category', newCat);
        else params.delete('category');
        router.push(`/updates/archive?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                    id="search"
                    placeholder="Keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/20 border-white/10 focus:border-primary/50"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <select
                    id="category-filter"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-black/20 border-white/10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="all">All Categories</option>
                    <option value="announcement">Announcement</option>
                    <option value="patch-notes">Patch Notes</option>
                    <option value="event">Event</option>
                    <option value="community">Community</option>
                </select>
            </div>
        </div>
    );
}
