"use client"

import { motion } from "framer-motion"

export function WhoWeAre() {
    return (
        <section className="py-24 bg-background relative z-10">
            <div className="container px-4 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-primary tracking-tight text-left">
                                Who We Are
                            </h2>
                        </div>

                        <div className="md:col-span-2 space-y-6 text-lg text-muted-foreground leading-relaxed text-left">
                            <p>
                                Welcome to Crafty Friends, a vibrant Minecraft community built on creativity, friendship, and adventure.
                                Founded in 2024, our mission has always been to provide a safe, engaging, and premium server experience for players of all ages.
                            </p>
                            <p>
                                Whether you're a master builder, a redstone engineer, or an explorer at heart, there's a place for you here.
                                We pride ourselves on our active staff, custom features, and a community that feels like family.
                                Join us and start crafting your own story today!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
