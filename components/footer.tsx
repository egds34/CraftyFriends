import Link from "next/link"

export function Footer() {
    return (
        <footer className="py-6 relative z-10 border-t border-border/10 bg-background/50 backdrop-blur-sm">
            <div className="container flex flex-col items-center justify-center gap-6 px-4 mx-auto">
                <div className="flex gap-4">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="bg-[#FF0000] p-2 rounded-xl text-white hover:scale-110 transition-transform flex items-center justify-center w-10 h-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                    </a>
                    <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="bg-[#9146FF] p-2 rounded-xl text-white hover:scale-110 transition-transform flex items-center justify-center w-10 h-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" /></svg>
                    </a>
                    <a href="https://discord.com" target="_blank" rel="noreferrer" className="bg-[#5865F2] p-2 rounded-xl text-white hover:scale-110 transition-transform flex items-center justify-center w-10 h-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-2.54-46.62-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                    </a>
                </div>

                <div className="flex gap-6 text-sm text-muted-foreground/80">
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                    <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
                </div>

                <p className="text-sm text-muted-foreground">
                    © 2025 Crafty Friends Server. All rights reserved. Not affiliated with Mojang Studios.
                </p>
            </div>
        </footer>
    )
}
