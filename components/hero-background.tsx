"use client"
import "react-responsive-carousel/lib/styles/carousel.min.css" // requires a loader
import { Carousel } from 'react-responsive-carousel'

interface HeroBackgroundProps {
    images: string[]
}

export function HeroBackground({ images }: HeroBackgroundProps) {
    // Fallback if no images are provided
    const bannerImages = images.length > 0 ? images : ["/images/banners/banner-1.png"]

    return (
        <div className="absolute inset-0 overflow-hidden -z-10 bg-black">
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10" />

            <div className="h-full w-full">
                <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    showArrows={false}
                    showIndicators={false}
                    stopOnHover={false}
                    interval={8000} // Longer interval to allow for zoom effect
                    transitionTime={2000}
                    animationHandler="fade"
                    className="h-full"
                >
                    {bannerImages.map((src, i) => (
                        <div key={i} className="h-screen w-full relative overflow-hidden">
                            <img
                                src={src}
                                alt={`Background ${i}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    )
}
