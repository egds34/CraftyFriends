
export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-heading font-black mb-8 text-primary">Cookie Policy</h1>

            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-8 font-bold text-center uppercase tracking-widest">
                Demo Purposes Only. This document is not legally binding and is for demonstration purposes only.
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget nunc lobortis mattis aliquam faucibus purus.
                    Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque.
                </p>
                <h3 className="text-xl font-bold text-foreground">1. What are Cookies?</h3>
                <p>
                    Elementum integer enim neque volutpat ac tincidunt vitae. Ut tellus elementum sagittis vitae et leo duis ut.
                    Malesuada fames ac turpis egestas integer eget aliquet nibh.
                </p>
                <h3 className="text-xl font-bold text-foreground">2. How We Use Cookies</h3>
                <p>
                    Placerat in egestas erat imperdiet sed euismod nisi porta lorem. Sit amet cursus sit amet dictum.
                    Velit egestas dui id ornare arcu. Id diam maecenas ultricies mi eget mauris pharetra et.
                </p>
                <h3 className="text-xl font-bold text-foreground">3. Managing Cookies</h3>
                <p>
                    In nibh mauris cursus mattis molestie. Amet dictum sit amet justo donec enim diam vulputate ut.
                    Nunc aliquet bibendum enim facilisis gravida neque convallis.
                </p>
            </div>
        </div>
    )
}
