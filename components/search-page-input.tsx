"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchPageInputProps {
    defaultValue?: string;
}

export function SearchPageInput({ defaultValue = "" }: SearchPageInputProps) {
    const router = useRouter();
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search for players, updates, and more..."
                    className="w-full bg-card/80 dark:bg-muted/30 border-2 border-border focus:border-primary/50 text-lg rounded-full pl-16 pr-8 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 shadow-xl"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-black font-bold px-6 py-2 rounded-full text-sm transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>
        </form>
    );
}
