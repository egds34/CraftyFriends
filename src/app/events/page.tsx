import { auth } from "@/auth"
import { getEvents, getEventTypeInfos } from "@/app/actions/events"
import { EventsClient } from "@/components/events/events-client"

export default async function EventsPage() {
    const session = await auth()
    const { data: events } = await getEvents()
    const { data: templates } = await getEventTypeInfos()

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container px-4 mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Server Events</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join the community for daily games, competitions, and social gatherings.
                    </p>
                </div>

                <EventsClient
                    initialEvents={events || []}
                    eventTemplates={templates || []}
                    userRole={session?.user?.role}
                />
            </div>
        </div>
    )
}
