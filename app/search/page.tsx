import { searchGlobal } from "@/app/actions/search";
import { SearchResultsClient } from "@/components/search-results-client";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

interface SearchPageProps {
    searchParams: {
        q?: string;
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q || "";
    const results = await searchGlobal(query);

    return (
        <div className="min-h-screen bg-black text-foreground pt-24 pb-20 relative">
            {/* Background ambiance */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-indigo-900/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 flex items-center gap-4">
                        <Search className="w-10 h-10 md:w-16 md:h-16 text-primary" />
                        Search Results
                    </h1>
                    {query && (
                        <p className="text-xl text-muted-foreground">
                            Found what you were looking for? Results for <span className="text-white font-bold">"{query}"</span>
                        </p>
                    )}
                </div>

                <SearchResultsClient query={query} results={results} />
            </div>
        </div>
    );
}
