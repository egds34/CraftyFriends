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
        image: "https://images.unsplash.com/photo-1547402830-1a74d1a019d3?q=80&w=1000&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1627798358248-c8375ae54443?q=80&w=1000&auto=format&fit=crop",
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
    },
    {
        id: "deep-sea-adventure",
        title: "Deep Sea Adventure Event",
        excerpt: "Dive into the depths with our new underwater exploration event! Discover lost ruins and coral treasures.",
        content: `
            <p>Gather your Respiration enchantments! The Great Reef is now open for exploration.</p>
            <h3>Event Highlights</h3>
            <ul>
                <li><strong>Sunken Temples:</strong> 5 new procedurally generated dungeons found in Deep Ocean biomes.</li>
                <li><strong>Trident Hunt:</strong> Increased drop rates for Drowned during the event period.</li>
                <li><strong>Conduit Rewards:</strong> Complete underwater challenges to earn rare Heart of the Sea fragments.</li>
            </ul>
        `,
        date: "2024-08-28",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop",
        author: "AdminX",
        category: "event",
        readTime: "4 min"
    },
    {
        id: "redstone-engineering-101",
        title: "Redstone Masterclass: Contraptions",
        excerpt: "Learn how to build advanced sorting systems and automatic farms in our community workshop series.",
        content: `<p>Calling all engineers! Our monthly community workshop is focusing on the power of Redstone.</p>`,
        date: "2024-08-15",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "6 min"
    },
    {
        id: "voting-rewards-buff",
        title: "Update: Triple Voting Rewards!",
        excerpt: "To celebrate our growing community, we are tripling all voting rewards for the next 48 hours.",
        content: `<p>Your support means everything. Go vote now on all 5 sites to claim massive rewards!</p>`,
        date: "2024-08-05",
        image: "https://images.unsplash.com/photo-1553481199-6565a5bb9109?q=80&w=1000&auto=format&fit=crop",
        author: "SysAdmin",
        category: "announcement",
        readTime: "2 min"
    },
    {
        id: "creative-world-v2",
        title: "Creative World 2.0 Patch Notes",
        excerpt: "Plots are now 50% larger! Plus, new WorldEdit permissions for veteran builders.",
        content: `<p>We've overhauled the Creative server with massive performance improvements and larger build areas.</p>`,
        date: "2024-07-20",
        image: "https://images.unsplash.com/photo-1506399558188-daf6f892f764?q=80&w=1000&auto=format&fit=crop",
        author: "DevTeam",
        category: "patch-notes",
        readTime: "3 min"
    },
    {
        id: "skyblock-genesis-launch",
        title: "Skyblock Season: Genesis",
        excerpt: "A fresh start! New island themes, revamped minion mechanics, and a competitive leaderboard.",
        content: `<p>Genesis brings a completely new way to play Skyblock. Start your island today and climb the ranks.</p>`,
        date: "2024-07-01",
        image: "https://images.unsplash.com/photo-1516281739211-3efbc3dec394?q=80&w=1000&auto=format&fit=crop",
        author: "Owner",
        category: "event",
        readTime: "5 min"
    },
    {
        id: "member-spotlight-builderz",
        title: "Member Spotlight: The BuilderZ Team",
        excerpt: "Meet the incredible build team behind our new Spawn City. Learn their tips and tricks.",
        content: `<p>We sat down with the leads of BuilderZ to discuss their massive cathedral project and what inspires them.</p>`,
        date: "2024-06-15",
        image: "https://images.unsplash.com/photo-1471018621131-f55104be1219?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "7 min"
    },
    {
        id: "anti-grief-update",
        title: "Security Update: Advanced Anti-Grief",
        excerpt: "We've implemented a custom rollback system and enhanced land protection features.",
        content: `<p>Your builds are safer than ever. New commands allow you to manage invitations to your land more easily.</p>`,
        date: "2024-06-02",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop",
        author: "SysAdmin",
        category: "announcement",
        readTime: "2 min"
    },
    {
        id: "spring-bloom-festival",
        title: "Spring Bloom Festival Recap",
        excerpt: "Thank you for attending the festival! See the winning builds from the flower arrangement contest.",
        content: `<p>Spring has truly bloomed on Crafty Friends. The community-made garden at spawn is now permanent!</p>`,
        date: "2024-05-20",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
        author: "CommunityMgr",
        category: "community",
        readTime: "3 min"
    },
    {
        id: "mob-arena-v2-notes",
        title: "Mob Arena Overhaul: V2 Released",
        excerpt: "Prepare for 100 waves of chaos! New boss mechanics, kit upgrades, and multiplayer rewards.",
        content: `<p>The Arena has been rebuilt from the ground up. Do you have what it takes to survive the final wave?</p>`,
        date: "2024-05-05",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
        author: "DevTeam",
        category: "patch-notes",
        readTime: "4 min"
    },
    {
        id: "treasure-hunt-weekend",
        title: "Treasure Hunt: Hidden Loot!",
        excerpt: "20 hidden chests have been placed around the survival world. Can you find them all before Sunday?",
        content: `<p>Grab your maps and start searching! Each chest contains rare items or seasonal tokens.</p>`,
        date: "2024-04-20",
        image: "https://images.unsplash.com/photo-1542401886-65d6c60db27b?q=80&w=1000&auto=format&fit=crop",
        author: "AdminX",
        category: "event",
        readTime: "2 min"
    }
];
