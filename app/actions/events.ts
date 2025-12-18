"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EventType } from "@prisma/client"
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"

export const getEvents = unstable_cache(
    async () => {
        try {
            const events = await prisma.event.findMany({
                orderBy: { startTime: 'asc' }
            })
            return { success: true, data: events }
        } catch (error) {
            console.error("Failed to fetch events", error)
            return { success: false, error: "Failed to fetch events" }
        }
    },
    ["events-list"],
    { revalidate: 3600, tags: ["events"] }
)

const DEFAULT_EVENT_INFOS = [
    {
        title: "Spleef Arena",
        description: "A fast-paced classic! Be the last one standing as the floor disappears beneath you.",
        image: "/images/events/spleef.png",
        shadowColor: "bg-blue-400/30",
        hoverColor: "group-hover:bg-blue-500",
        howTo: [
            "Join the /warp spleef when the event starts.",
            "Use your enchanted shovel to break snow blocks under other players.",
            "If you fall into the void/lava, you are out!",
            "Double-jump might be enabled depending on the round settings."
        ],
        rules: [
            "No teaming in solo matches.",
            "Using fly or speed hacks will result in an immediate ban.",
            "Respect the ref's decision on close calls.",
            "Don't stay in one corner for too long (camping)."
        ]
    },
    {
        title: "Neon Parkour",
        description: "Test your agility across floating neon glass blocks in the sky. Timing is everything.",
        image: "/images/events/parkour.png",
        shadowColor: "bg-purple-400/30",
        hoverColor: "group-hover:bg-purple-500",
        howTo: [
            "Sprint-jump through to reach the checkpoints.",
            "Wait for shifting blocks to align before making a leap.",
            "The course gets harder as you progress—watch for ice and slime.",
            "Fastest time recorded in /lb parkour wins the seasonal prize."
        ],
        rules: [
            "No using ender pearls or chorus fruit to skip stages.",
            "Don't block the view of other players at difficult jumps.",
            "The use of 'FullBright' or gamma mods is permitted.",
            "No /tpa during the race."
        ]
    },
    {
        title: "Build Battle",
        description: "Unleash your creativity! Build the best interpretation of a secret theme within 15 minutes.",
        image: "/images/events/build-battle.png",
        shadowColor: "bg-pink-400/30",
        hoverColor: "group-hover:bg-pink-500",
        howTo: [
            "You will be teleported to a creative plot when the theme is revealed.",
            "Use the provided block pallets to bring the theme to life.",
            "When the time ends, everyone will visit each plot to vote.",
            "Votes are anonymous: Superb, Good, OK, or Poop."
        ],
        rules: [
            "No building inappropriate or offensive shapes.",
            "Don't beg for votes or reveal your identity on your build.",
            "Griefing other players' views or entities is impossible but punishable.",
            "The theme must be strictly followed."
        ]
    }
]

export const getEventTypeInfos = unstable_cache(
    async () => {
        try {
            let infos = await prisma.eventTypeInfo.findMany({
                orderBy: { title: 'asc' }
            })

            if (infos.length === 0) {
                // Seed defaults
                await prisma.eventTypeInfo.createMany({
                    data: DEFAULT_EVENT_INFOS
                })
                infos = await prisma.eventTypeInfo.findMany({
                    orderBy: { title: 'asc' }
                })
            }

            return { success: true, data: infos }
        } catch (error) {
            console.error("Failed to fetch event type infos", error)
            return { success: false, error: "Failed to fetch event type infos" }
        }
    },
    ["event-type-infos"],
    { revalidate: 86400, tags: ["event-templates"] }
)

export async function updateEventTypeInfo(data: any) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const info = await prisma.eventTypeInfo.upsert({
            where: { title: data.title },
            update: {
                ...data,
                updatedAt: new Date()
            },
            create: data
        })
        revalidatePath("/events")
        revalidatePath("/")
        return { success: true, data: info }
    } catch (error) {
        console.error("Failed to update event type info", error)
        return { success: false, error: "Failed to update event type info" }
    }
}

import { addDays, addWeeks, addMonths, isBefore, isSameDay } from "date-fns"

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'

interface CreateEventInput {
    title: string
    description?: string
    startTime: Date
    durationMinutes: number
    type: EventType
    recurrence?: {
        type: RecurrenceType
        endDate?: Date
        daysOfWeek?: number[] // 0=Sunday, 6=Saturday
    }
}

export async function createEvent(data: CreateEventInput) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const eventsToCreate = []

        // Generate a seriesId if this is a recurring event
        // Note: crypto.randomUUID is available in recent Node versions and Edge runtimes
        const seriesId = (data.recurrence && data.recurrence.type !== 'NONE') ? crypto.randomUUID() : null

        // Always create the initial event
        eventsToCreate.push({
            title: data.title,
            description: data.description,
            startTime: data.startTime,
            durationMinutes: data.durationMinutes,
            type: data.type,
            seriesId
        })

        if (data.recurrence && data.recurrence.type !== 'NONE') {
            let current = new Date(data.startTime)
            // Use provided endDate OR default to 1 year from now if indefinite/missing
            const end = data.recurrence.endDate ? new Date(data.recurrence.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            const type = data.recurrence.type

            // Loop to generate future events
            // Increased limit for "Indefinite" (daily for a year = 365)
            let safetyCounter = 0
            const MAX_EVENTS = 366

            while (safetyCounter < MAX_EVENTS) {
                let nextDate: Date | null = null

                if (type === 'DAILY') {
                    nextDate = addDays(current, 1)
                } else if (type === 'WEEKLY') {
                    nextDate = addWeeks(current, 1)
                } else if (type === 'MONTHLY') {
                    nextDate = addMonths(current, 1)
                } else if (type === 'CUSTOM' && data.recurrence.daysOfWeek) {
                    // For custom, we check day by day
                    nextDate = addDays(current, 1)
                    // If the next day isn't in the list, we keep checking inside the loop? 
                    // No, "Custom Days" usually implies "Every Mon, Wed, Fri".
                    // So we iterate day by day until end date, checking if matches.
                    // But simpler logic: iterate days, if match, add event.
                }

                if (type === 'CUSTOM') {
                    // Custom Logic: Advance 1 day at a time
                    current = addDays(current, 1)
                    if (isBefore(end, current)) break;

                    if (data.recurrence.daysOfWeek?.includes(current.getDay())) {
                        eventsToCreate.push({
                            title: data.title,
                            description: data.description,
                            startTime: new Date(current), // New instance
                            durationMinutes: data.durationMinutes,
                            type: data.type,
                            seriesId
                        })
                        safetyCounter++
                    }
                } else {
                    // Standard Logic
                    if (!nextDate) break
                    current = nextDate

                    if (isBefore(end, current)) break;

                    eventsToCreate.push({
                        title: data.title,
                        description: data.description,
                        startTime: new Date(current),
                        durationMinutes: data.durationMinutes,
                        type: data.type,
                        seriesId
                    })
                    safetyCounter++
                }
            }
        }

        // Batch create
        // Prisma doesn't return created records in createMany, so we use transaction or repeated create if we want IDs.
        // But for this use case, createMany is fine, we just return 'success'.
        // Wait, SQLite/Postgres support createMany.
        await prisma.event.createMany({
            data: eventsToCreate
        })

        revalidatePath("/events")
        revalidatePath("/")
        return { success: true, count: eventsToCreate.length }
    } catch (error) {
        console.error("Failed to create event", error)
        return { success: false, error: "Failed to create event" }
    }
}

export async function deleteEvent(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.event.delete({ where: { id } })
        revalidatePath("/events")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete event", error)
        return { success: false, error: "Failed to delete event" }
    }
}

export async function deleteEventSeries(seriesId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.event.deleteMany({ where: { seriesId } })
        revalidatePath("/events")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete event series", error)
        return { success: false, error: "Failed to delete event series" }
    }
}
