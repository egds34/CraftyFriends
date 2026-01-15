
export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-heading font-black mb-8 text-primary">Privacy Policy</h1>

            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-8 font-bold text-center uppercase tracking-widest">
                Demo Purposes Only. This document is not legally binding and is for demonstration purposes only.
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <h3 className="text-xl font-bold text-foreground">1. Data Collection</h3>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <h3 className="text-xl font-bold text-foreground">2. Data Usage</h3>
                <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
                    eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
                <h3 className="text-xl font-bold text-foreground">3. Third Party Services</h3>
                <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                    qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                </p>
            </div>
        </div>
    )
}
