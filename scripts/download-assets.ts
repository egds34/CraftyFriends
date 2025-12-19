import fs from 'fs';
import path from 'path';
import https from 'https';
import { ADVANCEMENTS_DATA } from '../lib/advancements-data';

const DEST_DIR = '/home/christy/.gemini/antigravity/scratch/CraftyFriends/public/images/advancements/items';

function downloadImage(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirect
                if (response.headers.location) {
                    downloadImage(response.headers.location, dest).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Redirect with no location`));
                }
            } else {
                fs.unlink(dest, () => { }); // Delete empty file
                reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

function formatIconName(icon: string): string {
    return icon.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

async function main() {
    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const icons = new Set<string>();
    Object.values(ADVANCEMENTS_DATA).forEach(adv => {
        if (adv.icon) icons.add(adv.icon);
    });

    console.log(`Downloading ${icons.size} icons...`);

    let successCount = 0;
    let failCount = 0;

    for (const icon of icons) {
        const filename = `${icon}.png`;
        const destPath = path.join(DEST_DIR, filename);

        // Skip if exists
        if (fs.existsSync(destPath)) {
            // console.log(`Skipping ${icon} (already exists)`);
            successCount++;
            continue;
        }

        const formattedName = formatIconName(icon);
        const url = `https://minecraft.wiki/images/Invicon_${formattedName}.png`;

        try {
            // console.log(`Downloading ${formattedName}...`);
            await downloadImage(url, destPath);
            successCount++;
            // Nice little delay to be polite to the wiki
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Failed to download ${icon}: ${(error as Error).message}`);
            // Try fallback URL for common mismatches if needed?
            // For now just log it.
            failCount++;
        }
    }

    console.log(`Download complete! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
