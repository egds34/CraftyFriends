
export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-heading font-black mb-8 text-primary">Terms of Service</h1>

            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-8 font-bold text-center uppercase tracking-widest">
                Demo Purposes Only. This document is not legally binding and is for demonstration purposes only.
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Netus et malesuada fames ac turpis egestas integer eget.
                </p>
                <h3 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h3>
                <p>
                    Viverra nam libero justo laoreet sit amet cursus sit amet. Dictumst quisque sagittis purus sit amet volutpat consequat mauris.
                    Eget dolor morbi non arcu risus quis varius quam.
                </p>
                <h3 className="text-xl font-bold text-foreground">2. User Conduct</h3>
                <p>
                    Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam. Velit egestas dui id ornare arcu odio ut sem.
                    Faucibus pulvinar elementum integer enim neque volutpat ac tincidunt.
                </p>
                <h3 className="text-xl font-bold text-foreground">3. Termination</h3>
                <p>
                    Amet consectetur adipiscing elit pellentesque habitant morbi tristique. Amet porttitor eget dolor morbi non arcu risus quis.
                    Venenatis urna cursus eget nunc scelerisque viverra mauris in.
                </p>
            </div>
        </div>
    )
}
