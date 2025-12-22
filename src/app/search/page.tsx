import { searchGlobal } from "@/app/actions/search";
import { SearchResultsClient } from "@/components/search/search-results-client";
import { SearchPageInput } from "@/components/search/search-page-input";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const query = q || "";
    const results = await searchGlobal(query);

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-20 relative">
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-0 w-full h-[50vh] bg-primary/5 opacity-50 transition-colors duration-500"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-8 flex items-center gap-4">
                        <Search className="w-10 h-10 md:w-16 md:h-16 text-primary" />
                        Search Results
                    </h1>

                    <div className="flex flex-col gap-6">
                        <SearchPageInput defaultValue={query} />

                        {query && (
                            <p className="text-xl text-muted-foreground ml-2">
                                Found what you were looking for? Results for <span className="text-foreground font-bold">"{query}"</span>
                            </p>
                        )}
                    </div>
                </div>

                <SearchResultsClient query={query} results={results} />
            </div>
        </div>
    );
}
