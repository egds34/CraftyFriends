import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Route segment config
export const runtime = 'nodejs'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
    // Use readFile with import.meta.url to resolve the path relative to this file
    // This works better than fetch() for local files during build
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const iconPath = join(__dirname, 'icon.png')
    const iconData = await readFile(iconPath)

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Background Patterns */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%)',
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Content Container */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        zIndex: 10
                    }}
                >
                    {/* Logo / Icon */}
                    <img
                        // @ts-ignore
                        src={iconData}
                        width={200}
                        height={200}
                        style={{
                            borderRadius: '30px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            border: '4px solid rgba(255,255,255,0.1)',
                            objectFit: 'cover'
                        }}
                    />

                    {/* Title */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ fontSize: 80, fontWeight: 'bold', letterSpacing: '-0.05em' }}>
                            Crafty Friends
                        </div>
                    </div>
                </div>

                {/* Decorative corner accents for "cutsie/classy" feel */}
                <div style={{ position: 'absolute', top: 40, left: 40, width: 20, height: 20, borderRadius: '50%', background: '#F472B6', opacity: 0.6 }} />
                <div style={{ position: 'absolute', bottom: 40, right: 40, width: 30, height: 30, borderRadius: '50%', background: '#38BDF8', opacity: 0.6 }} />

            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
