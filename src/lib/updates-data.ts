export type UpdateCategory = 'patch-notes' | 'event' | 'community' | 'announcement';

export interface ServerUpdate {
    id: string;
    title: string;
    excerpt: string;
    content: string; // HTML or Markdown string
    date: string;
    image: string;
    author: string;
    category: UpdateCategory;
    readTime: string;
}

export const updatesData: ServerUpdate[] = [
    {
        id: "winter-wonderland-2024",
        title: "Winter Wonderland Event",
        excerpt: "Join us for our annual winter celebration with new mini-games, exclusive rewards, and a snowy spawn!",
        content: `
            <p>The snow has fallen, and the festive spirit is in the air! Crafty Friends is proud to announce the return of our annual Winter Wonderland event.</p>
            <h3>What's New?</h3>
            <ul>
                <li><strong>Snowy Spawn:</strong> Explore a completely redesigned spawn area covered in snow and decorations.</li>
                <li><strong>Spleef Tournament:</strong> Compete in our daily Spleef tournaments to win the exclusive 'Ice King' title.</li>
                <li><strong>Present Hunt:</strong> Find hidden presents around the map to earn Winter Tokens.</li>
            </ul>
            <p>Don't miss out on the fun! The event runs until January 5th.</p>
        `,
        date: "2024-12-15",
        image: "https://images.unsplash.com/photo-1483664852095-d6cc6870705d?q=80&w=1000&auto=format&fit=crop",
        author: "AdminX",
        category: "event",
        readTime: "3 min"
    },
    {
        id: "patch-notes-v1-4-2",
        title: "Patch Notes v1.4.2: Combat Balance",
        excerpt: "Adjustments to PvP cooldowns, new enchantment caps, and bug fixes for the Economy plugin.",
        content: `
            <p>We've been listening to your feedback regarding PvP balance, and today we're rolling out some changes.</p>
            <h3>Combat Adjustments</h3>
            <ul>
                <li>Sword cooldown reduced by 10% for diamond tier.</li>
                <li>Shield durability increased by 20%.</li>
                <li><strong>New Rule:</strong> Potions of Strength II are now limited to 90 seconds in PvP zones.</li>
            </ul>
            <h3>Bug Fixes</h3>
            <ul>
                <li>Fixed an issue where shop signs wouldn't update prices correctly.</li>
                <li>Resolved a crash related to teleporting while riding a horse.</li>
            </ul>
        `,
        date: "2024-12-10",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
        author: "DevTeam",
        category: "patch-notes",
        readTime: "5 min"
    },
    {
        id: "community-showcase-november",
        title: "Community Build Showcase: November",
        excerpt: "Check out the incredible builds from last month's build contest! The theme was 'Floating Islands'.",
        content: `
            <p>You guys really outdid yourselves this month! The 'Floating Islands' theme brought out some of the most creative builds we've ever seen.</p>
            <h3>Winner: SkyHighKeep by BuilderBob</h3>
            <p>Bob's massive castle utilizing using chains and cloud blocks blew the judges away.</p>
            <h3>Runner Up: AeroVillage by CraftyClara</h3>
            <p>A charming village connected by rainbow bridges. Absolutely stunning use of glass panes.</p>
        `,
        date: "2024-12-01",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "4 min"
    },
    {
        id: "server-maintenance-notice",
        title: "Scheduled Maintenance",
        excerpt: "The server will be down for approximately 2 hours on Dec 5th for hardware upgrades.",
        content: `
            <p>We are upgrading our server RAM to ensure smoother gameplay for everyone. Downtime is expected to be minimal.</p>
            <p>Date: December 5th<br>Time: 2:00 AM UTC - 4:00 AM UTC</p>
        `,
        date: "2024-11-28",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
        author: "SysAdmin",
        category: "announcement",
        readTime: "1 min"
    },
    {
        id: "economy-overhaul",
        title: "Economy Overhaul: Introducing Credits",
        excerpt: "We are switching from 'Gold Ingots' to a virtual currency system. Here is what you need to know.",
        content: "We are modernizing the economy...",
        date: "2024-11-15",
        image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop",
        author: "AdminX",
        category: "announcement",
        readTime: "6 min"
    },
    {
        id: "halloween-spooktacular-recap",
        title: "Halloween Spooktacular Recap",
        excerpt: "A look back at the terrifyingly fun events of October. See who won the costume contest!",
        content: "<p>The ghosts have departed...</p>",
        date: "2024-11-01",
        image: "https://images.unsplash.com/photo-1508361001413-5658ced6d9ef?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "3 min"
    },
    {
        id: "new-biome-discovery",
        title: "New Biome Discovered: The Crystal Caverns",
        excerpt: "Explorers have found a massive underground network filled with glowing crystals and new mobs.",
        content: "<p>Deep beneath the spawn...</p>",
        date: "2024-10-20",
        image: "https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=1000&auto=format&fit=crop",
        author: "DevTeam",
        category: "patch-notes",
        readTime: "2 min"
    },
    {
        id: "server-anniversary",
        title: "Crafty Friends 2nd Anniversary!",
        excerpt: "Thank you for two amazing years. Claim your free anniversary cape in the lobby.",
        content: "<p>Time flies when you are crafting...</p>",
        date: "2024-10-10",
        image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1000&auto=format&fit=crop",
        author: "Owner",
        category: "event",
        readTime: "1 min"
    },
    {
        id: "parkour-challenge-winners",
        title: "Parkour Challenge Winners",
        excerpt: "Congratulations to our top 3 parkour masters who conquered the 'Tower of Pain'.",
        content: "<p>It was a grueling climb...</p>",
        date: "2024-09-25",
        image: "https://images.unsplash.com/photo-1528158222505-1a2c6769f34a?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "2 min"
    },
    {
        id: "builder-wand-update",
        title: "Builder's Wand Update",
        excerpt: "The Builder's Wand item has been buffed! You can now place up to 64 blocks at once.",
        content: "<p>Building just got easier...</p>",
        date: "2024-09-10",
        image: "https://images.unsplash.com/photo-1587582423116-ca704f5590a8?q=80&w=1000&auto=format&fit=crop",
        author: "DevTeam",
        category: "patch-notes",
        readTime: "1 min"
    }
];
